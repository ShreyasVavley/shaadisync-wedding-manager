import React, { useState, useEffect } from 'react';
import type { EventDetails, Guest } from '../types/wedding';
import {
  X,
  Bot,
  Zap,
  Play,
  Check,
  Send,
  Smartphone,
  Key,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_enabled: number;
  schedule_description: string;
  last_run_at: string;
  total_dispatched: number;
}

interface WebhookLog {
  id: string;
  sender_phone: string;
  guest_name: string | null;
  message_content: string;
  parsed_action: string;
  reply_sent: string | null;
  status: string;
  timestamp: string;
}

interface AutomationControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  guests: Guest[];
}

export const AutomationControlModal: React.FC<AutomationControlModalProps> = ({
  isOpen,
  onClose,
  event,
  guests,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'credentials'>('rules');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingRuleId, setLoadingRuleId] = useState<string | null>(null);

  // Simulator state
  const [simGuestId, setSimGuestId] = useState(guests[0]?.id || '');
  const [simMessage, setSimMessage] = useState('Haan 4 pax veg coming by 7:30pm');
  const [simResult, setSimResult] = useState<{ reply: string; action: string } | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Credentials state
  const [metaToken, setMetaToken] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [verifyToken, setVerifyToken] = useState('shaadi_sync_verify_123');
  const [hasToken, setHasToken] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/automations');
      if (res.ok) setRules(await res.json());

      const logsRes = await fetch('/api/webhook/logs');
      if (logsRes.ok) setLogs(await logsRes.json());

      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setHasToken(configData.hasToken);
        setPhoneId(configData.phoneId || '');
        setVerifyToken(configData.verifyToken || 'shaadi_sync_verify_123');
      }
    } catch (err) {
      console.error('Error fetching automations', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAutomations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleRule = async (ruleId: string, currentVal: number) => {
    try {
      const res = await fetch(`/api/automations/${ruleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: currentVal === 0 }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, is_enabled: currentVal === 0 ? 1 : 0 } : r))
        );
      }
    } catch (err) {
      console.error('Toggle rule failed', err);
    }
  };

  const handleTriggerRule = async (ruleId: string) => {
    setLoadingRuleId(ruleId);
    try {
      const res = await fetch(`/api/automations/${ruleId}/trigger`, { method: 'POST' });
      if (res.ok) {
        await fetchAutomations();
      }
    } catch (err) {
      console.error('Trigger rule failed', err);
    } finally {
      setLoadingRuleId(null);
    }
  };

  const handleSimulateInbound = async () => {
    setSimulating(true);
    try {
      const selectedGuest = guests.find((g) => g.id === simGuestId) || guests[0];
      const res = await fetch('/api/webhook/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: selectedGuest?.phone || '+91 98100 12345',
          messageText: simMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimResult({
          reply: data.reply,
          action: data.guest?.status || 'auto_replied',
        });
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error('Simulate failed', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: metaToken,
          phoneId,
          verifyToken,
        }),
      });
      setConfigSaved(true);
      setHasToken(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch (err) {
      console.error('Save config failed', err);
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhook/whatsapp`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-neutral-950 text-white shadow-md">
              <Bot className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Messaging Automation &amp; Webhook Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Automated WhatsApp triggers &amp; inbound AI for {event.couple}'s wedding reception
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Scheduled Rules ({rules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Two-Way WhatsApp Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Key className="w-4 h-4 text-neutral-600" />
            <span>Meta API &amp; Webhooks</span>
          </button>
        </div>

        {/* TAB 1: Scheduled Automation Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="text-xs text-neutral-500 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>
                  Background worker runs every 60s checking T-48h cutoff and day-of morning schedules.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Daemon Active
              </span>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900">{rule.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                            rule.is_enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {rule.is_enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{rule.description}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id, rule.is_enabled)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        rule.is_enabled ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          rule.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-600">
                    <div className="flex items-center gap-3">
                      <span>
                        ⏰ <span className="font-semibold">{rule.schedule_description}</span>
                      </span>
                      <span>
                        📊 Dispatched:{' '}
                        <span className="font-bold text-neutral-900 font-mono">
                          {rule.total_dispatched}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerRule(rule.id)}
                      disabled={loadingRuleId === rule.id}
                      className="px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 text-amber-400" />
                      <span>{loadingRuleId === rule.id ? 'Executing...' : 'Trigger Now'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Two-Way WhatsApp Inbound Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="text-xs text-neutral-600">
              Test how the system parses incoming WhatsApp replies from wedding guests in natural Hindi/English (e.g. "Haan 4 pax veg", "Sorry cannot come", "3 Jain 8pm").
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Select Guest to Simulate Message From
                </label>
                <select
                  value={simGuestId}
                  onChange={(e) => setSimGuestId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white mt-1"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.phone}) — Status: {g.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Quick Sample Inputs
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setSimMessage('Haan 4 pax pure veg arriving 8pm for Sangeet & Reception')}
                    className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[10px] font-semibold text-neutral-700"
                  >
                    "4 veg (Sangeet & Reception)"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Confirmed 2 Non-veg arriving 8:30pm for Reception only')}
                    className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[10px] font-semibold text-neutral-700"
                  >
                    "2 Non-veg (Reception only)"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Sorry cannot come, sending best wishes')}
                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[10px] font-semibold text-rose-700"
                  >
                    "Sorry cannot come"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Confirmed 5 Jain')}
                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[10px] font-semibold text-amber-700"
                  >
                    "Confirmed 5 Jain"
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Incoming WhatsApp Chat Message
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white"
                  placeholder="Type what guest would text back..."
                />
                <button
                  type="button"
                  onClick={handleSimulateInbound}
                  disabled={simulating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{simulating ? 'Parsing...' : 'Send to Bot'}</span>
                </button>
              </div>
            </div>

            {/* Simulation Bot Reply */}
            {simResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Database Auto-Updated: {simResult.action.toUpperCase()}</span>
                  </div>
                  <span className="text-[10px] font-normal text-emerald-700">Live Chime Triggered</span>
                </div>
                <div className="bg-[#efeae2] p-3 rounded-xl border border-neutral-300 text-xs text-neutral-800 whitespace-pre-wrap font-sans">
                  {simResult.reply}
                </div>
              </div>
            )}

            {/* Recent Webhook Transaction Logs */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Recent Webhook Transactions</span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-neutral-100 text-[11px]">
                {logs.length === 0 ? (
                  <div className="p-4 text-center text-neutral-400">No webhook transactions yet.</div>
                ) : (
                  logs.slice(0, 5).map((l) => (
                    <div key={l.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-900">{l.guest_name || l.sender_phone}</span>:{" "}
                        <span className="text-neutral-600 italic">"{l.message_content}"</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-700">
                        {l.parsed_action}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Meta WhatsApp Cloud API Setup */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-neutral-900">
                    Official Meta WhatsApp Cloud API (v21.0)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasToken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {hasToken ? 'CONNECTED' : 'SIMULATOR MODE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Without credentials, the system runs in high-fidelity simulator mode (instant responses, fake message IDs). Enter your Meta Graph API keys below to dispatch real WhatsApp messages to phone numbers!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Meta Permanent Access Token (WHATSAPP_TOKEN)
                </label>
                <input
                  type="password"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  placeholder={hasToken ? '•••••••••••••••••••••••• (Configured)' : 'EAA...'}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white font-mono mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Phone Number ID (From Meta App Dashboard)
                </label>
                <input
                  type="text"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  placeholder="e.g. 104829104820194"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white font-mono mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Webhook Callback URL (Paste in Meta Developer Console)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-100 font-mono mt-1 text-neutral-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white font-mono mt-1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                {configSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Key className="w-4 h-4" />}
                <span>{configSaved ? 'Saved to SQLite Configuration!' : 'Save API Credentials'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
