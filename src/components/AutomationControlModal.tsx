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

  // Meta Credentials state
  const [metaToken, setMetaToken] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [verifyToken, setVerifyToken] = useState('shaadisync_secret_webhook_verify_2026');
  const [hasToken, setHasToken] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/automations')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRules(data))
      .catch((e) => console.error(e));

    fetch('/api/webhook/logs')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(data))
      .catch((e) => console.error(e));

    fetch('/api/config')
      .then((r) => (r.ok ? r.json() : ({} as any)))
      .then((data: any) => {
        setHasToken(data.hasToken);
        setPhoneId(data.phoneId || '');
        setVerifyToken(data.verifyToken || 'shaadisync_secret_webhook_verify_2026');
      })
      .catch((e) => console.error(e));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleRule = async (ruleId: string, currentEnabled: number) => {
    const nextState = currentEnabled ? 0 : 1;
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_enabled: nextState } : r))
    );

    await fetch(`/api/automations/${ruleId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: nextState === 1 }),
    });
  };

  const handleTriggerRule = async (ruleId: string) => {
    setLoadingRuleId(ruleId);
    try {
      const res = await fetch(`/api/automations/${ruleId}/trigger`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Dispatched rule to ${data.dispatched} recipients!`);
        // Refresh rules
        const rulesRes = await fetch('/api/automations');
        if (rulesRes.ok) setRules(await rulesRes.json());
      }
    } catch (err) {
      console.error('Trigger failed', err);
    } finally {
      setLoadingRuleId(null);
    }
  };

  const handleSimulateInbound = async () => {
    if (!simMessage.trim()) return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 space-y-5 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
              <Bot className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Messaging Automation &amp; Webhook Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Automated WhatsApp triggers &amp; inbound AI for {event.couple}'s wedding reception
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Scheduled Rules ({rules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Two-Way WhatsApp Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-neutral-400" />
            <span>Meta API &amp; Webhooks</span>
          </button>
        </div>

        {/* TAB 1: Scheduled Automation Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="text-xs text-neutral-300 bg-neutral-900/90 p-3.5 rounded-2xl border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Background worker runs every 60s checking T-48h cutoff and day-of morning schedules.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                Daemon Active
              </span>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 hover:border-amber-500/40 transition space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                            rule.is_enabled
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {rule.is_enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{rule.description}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id, rule.is_enabled)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        rule.is_enabled ? 'bg-emerald-500' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          rule.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span>
                        ⏰ <span className="font-semibold text-neutral-200">{rule.schedule_description}</span>
                      </span>
                      <span>
                        📊 Dispatched:{' '}
                        <span className="font-bold text-amber-300 font-mono">
                          {rule.total_dispatched}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerRule(rule.id)}
                      disabled={loadingRuleId === rule.id}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-[10px] font-black flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 text-neutral-950" />
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
            <div className="text-xs text-neutral-400">
              Test how the system parses incoming WhatsApp replies from wedding guests in natural Hindi/English (e.g. "Haan 4 pax veg", "Sorry cannot come", "3 Jain 8pm").
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Select Guest to Simulate Message From
                </label>
                <select
                  value={simGuestId}
                  onChange={(e) => setSimGuestId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white mt-1 focus:outline-none focus:border-amber-400"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.phone}) — Status: {g.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Quick Sample Inputs
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setSimMessage('Haan 4 pax veg coming by 7:30pm')}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-200 border border-neutral-700"
                  >
                    "Haan 4 pax veg"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Confirmed 2 Non-veg arriving 8:30pm')}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-200 border border-neutral-700"
                  >
                    "Confirmed 2 Non-veg"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Sorry cannot come, sending best wishes')}
                    className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-[10px] font-semibold text-rose-300 border border-rose-500/40"
                  >
                    "Sorry cannot come"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Confirmed 5 Jain')}
                    className="px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-[10px] font-semibold text-amber-300 border border-amber-500/40"
                  >
                    "Confirmed 5 Jain"
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Incoming WhatsApp Chat Message
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  placeholder="Type what guest would text back..."
                />
                <button
                  type="button"
                  onClick={handleSimulateInbound}
                  disabled={simulating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{simulating ? 'Parsing...' : 'Send to Bot'}</span>
                </button>
              </div>
            </div>

            {/* Simulation Bot Reply */}
            {simResult && (
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 space-y-2 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Database Auto-Updated: <strong className="text-emerald-300">{simResult.action.toUpperCase()}</strong></span>
                  </div>
                  <span className="text-[10px] font-normal text-emerald-400">Live Chime Triggered</span>
                </div>
                <div className="bg-[#0b141a] text-neutral-200 p-3 rounded-xl border border-neutral-700/60 text-xs whitespace-pre-wrap font-sans">
                  {simResult.reply}
                </div>
              </div>
            )}

            {/* Recent Webhook Transaction Logs */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Recent Webhook Transactions</span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-neutral-800 divide-y divide-neutral-800 text-[11px] bg-neutral-950/60">
                {logs.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">No webhook transactions yet.</div>
                ) : (
                  logs.slice(0, 5).map((l) => (
                    <div key={l.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-900/50">
                      <div>
                        <span className="font-bold text-white">{l.guest_name || l.sender_phone}</span>:{' '}
                        <span className="text-neutral-400 italic">"{l.message_content}"</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 font-bold text-amber-300 border border-neutral-700">
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
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Official Meta WhatsApp Cloud API (v21.0)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasToken ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {hasToken ? 'CONNECTED' : 'SIMULATOR MODE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Without credentials, the system runs in high-fidelity simulator mode (instant responses, fake message IDs). Enter your Meta Graph API keys below to dispatch real WhatsApp messages to phone numbers!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Meta Permanent Access Token (WHATSAPP_TOKEN)
                </label>
                <input
                  type="password"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  placeholder={hasToken ? '•••••••••••••••••••••••• (Configured)' : 'EAA...'}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white font-mono mt-1 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Phone Number ID (From Meta App Dashboard)
                </label>
                <input
                  type="text"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  placeholder="e.g. 104829104820194"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white font-mono mt-1 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Webhook Callback URL (Paste in Meta Developer Console)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 font-mono mt-1 text-neutral-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white font-mono mt-1 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg"
              >
                {configSaved ? <Check className="w-4 h-4 text-neutral-950" /> : <Key className="w-4 h-4 text-neutral-950" />}
                <span>{configSaved ? 'Saved to SQLite Configuration!' : 'Save API Credentials'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
