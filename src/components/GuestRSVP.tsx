import React, { useState } from 'react';
import type { Guest, EventDetails, DietPreference, SupportedLanguage } from '../types/wedding';
import { ArrivalClock } from './ArrivalClock';
import { ShimmerButton } from './ui/shimmer-button';
import { BackgroundPattern } from './ui/background-pattern';
import { DigitalGatePassModal } from './DigitalGatePassModal';
import { translations } from '../utils/translations';
import confetti from 'canvas-confetti';
import { Check, Calendar, MapPin, Music, Heart, ArrowLeft, Send, QrCode } from 'lucide-react';

interface GuestRSVPProps {
  guest: Guest;
  event: EventDetails;
  onSubmitRSVP: (rsvpData: {
    guestId: string;
    token?: string;
    status: 'confirmed' | 'declined';
    attendingCount: number;
    diet: DietPreference | null;
    arrivalTime: string | null;
    songRequest?: string;
    notes?: string;
    subEvents?: Record<string, boolean>;
    tableNumber?: string | null;
  }) => Promise<void>;
  onBackToDashboard?: () => void;
  isStandalone?: boolean;
}

export const GuestRSVP: React.FC<GuestRSVPProps> = ({
  guest,
  event,
  onSubmitRSVP,
  onBackToDashboard,
  isStandalone = false,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const t = translations[lang];

  const [status, setStatus] = useState<'confirmed' | 'declined' | null>(
    guest.status !== 'pending' ? guest.status : null
  );
  const [attendingCount, setAttendingCount] = useState<number>(
    guest.attendingCount > 0 ? guest.attendingCount : guest.invitedCount || 2
  );
  const [diet, setDiet] = useState<DietPreference>(guest.diet || 'veg');
  const [arrivalTime, setArrivalTime] = useState<string>(guest.arrivalTime || '07:30 PM');
  const [songRequest, setSongRequest] = useState<string>(guest.songRequest || '');
  const [notes, setNotes] = useState<string>(guest.notes || '');

  // Sub-events attendance defaults scoped strictly to this family's allowed invitations
  const allowedList = guest.allowedSubEvents || ['wedding', 'reception'];
  const defaultSubEvents = event.subEvents
    ? event.subEvents.reduce((acc, ev) => ({ ...acc, [ev.id]: allowedList.includes(ev.id) }), {} as Record<string, boolean>)
    : { haldi: false, sangeet: true, wedding: true, reception: true };
  const [subEvents, setSubEvents] = useState<Record<string, boolean>>(guest.subEvents || defaultSubEvents);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(guest.status !== 'pending');
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('pass') === '1'
  );

  const handleAttendSelect = (choice: 'confirmed' | 'declined') => {
    setStatus(choice);
    if (choice === 'declined') {
      setAttendingCount(0);
    } else if (attendingCount === 0) {
      setAttendingCount(guest.invitedCount || 2);
    }
  };

  const handleIncrement = () => {
    setAttendingCount((prev) => Math.min(8, prev + 1));
  };

  const handleDecrement = () => {
    setAttendingCount((prev) => Math.max(1, prev - 1));
  };

  const handleToggleSubEvent = (id: string) => {
    setSubEvents((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      await onSubmitRSVP({
        guestId: guest.id,
        token: guest.magicToken,
        status,
        attendingCount: status === 'confirmed' ? attendingCount : 0,
        diet: status === 'confirmed' ? diet : null,
        arrivalTime: status === 'confirmed' ? arrivalTime : null,
        songRequest,
        notes,
        subEvents: status === 'confirmed' ? subEvents : undefined,
      });

      if (status === 'confirmed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0f172a', '#e2e8f0', '#10b981', '#f59e0b', '#ec4899'],
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit RSVP. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackgroundPattern
        variant="dots"
        spotlight={true}
        spotlightSize={280}
        className="w-full max-w-md mx-auto min-h-[720px] rounded-3xl shadow-xl border border-neutral-200/90 flex flex-col justify-between overflow-hidden relative bg-white"
      >
        {/* Top Header - Exact replica of the Reel design + Language Switcher */}
        <div className="pt-5 px-6 pb-3 border-b border-neutral-100 flex items-center justify-between text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {onBackToDashboard && !isStandalone && (
              <button
                onClick={onBackToDashboard}
                className="p-1 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition"
                title="Return to Host Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span>{t.headerBadge}</span>
          </div>

          {/* Language Switcher Pill Group */}
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-full border border-neutral-200/60 font-sans tracking-normal">
            {(
              [
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हिं' },
                { code: 'gu', label: 'ગુ' },
                { code: 'pa', label: 'ਪੰ' },
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition ${
                  lang === l.code
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
                title={`Switch language to ${l.code}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
          {/* Main Content */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invitation Header Monogram */}
              <div className="text-center py-2 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold">
                  {t.togetherFamilies}
                </div>

                {/* Circle Monogram matching Reel frame 21.5s */}
                <div className="w-20 h-20 rounded-full border border-neutral-800 mx-auto flex items-center justify-center bg-white shadow-sm ring-4 ring-neutral-100">
                  <span className="font-serif text-2xl font-light tracking-wide text-neutral-900">
                    A &amp; R
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold tracking-widest uppercase text-neutral-950">
                    {t.weddingInvitation}
                  </h2>
                  <div className="w-12 h-0.5 bg-neutral-200 mx-auto rounded-full" />
                  <p className="text-xs text-neutral-600 pt-1 font-medium">
                    {t.dearGuest} <span className="font-bold text-neutral-900">{guest.name}</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {event.date} • {event.venue}
                  </p>
                </div>
              </div>

              {/* Question 1: Will you attend? */}
              <div className="space-y-3 pt-2">
                <label className="block text-center text-lg font-black tracking-tight text-neutral-950 uppercase">
                  {t.willYouAttend}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAttendSelect('confirmed')}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 border ${
                      status === 'confirmed'
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-neutral-950/20'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    {status === 'confirmed' && <Check className="w-4 h-4 stroke-[3]" />}
                    {t.yesAttend}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAttendSelect('declined')}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 border ${
                      status === 'declined'
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-neutral-950/20'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    {status === 'declined' && <Check className="w-4 h-4 stroke-[3]" />}
                    {t.noDecline}
                  </button>
                </div>
              </div>

              {/* If Confirmed, show details */}
              {status === 'confirmed' && (
                <div className="space-y-6 pt-4 border-t border-neutral-100 animate-slide-up">
                  {/* Number of Guests */}
                  <div className="text-center space-y-2">
                    <div className="text-[11px] tracking-[0.2em] font-semibold text-neutral-400 uppercase">
                      {t.confirmHeadcount}
                    </div>
                    <div className="flex items-center justify-center gap-6 py-2">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={attendingCount <= 1}
                        className="w-11 h-11 rounded-full border border-neutral-300 text-neutral-800 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 disabled:opacity-30 transition shadow-sm"
                      >
                        -
                      </button>
                      <span className="text-4xl font-extrabold text-neutral-950 w-12 text-center font-mono">
                        {attendingCount}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={attendingCount >= 8}
                        className="w-11 h-11 rounded-full border border-neutral-300 text-neutral-800 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 disabled:opacity-30 transition shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                      {t.reservingPlates} • {attendingCount} {attendingCount === 1 ? 'Guest' : t.guestsCount}
                    </div>
                  </div>

                  {/* Multi-Event Ceremony Checklist - Strictly scoped to this family's allowed invitations */}
                  {event.subEvents && event.subEvents.filter((c) => allowedList.includes(c.id)).length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 mb-1">
                          <span>Invitations Scoped to Your Family</span>
                        </div>
                        <h3 className="text-sm font-black tracking-tight text-neutral-950 uppercase">
                          {t.ceremoniesTitle}
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          {t.ceremoniesSubtitle}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {event.subEvents
                          .filter((c) => allowedList.includes(c.id))
                          .map((c) => {
                          const isAttending = subEvents[c.id] !== false;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleToggleSubEvent(c.id)}
                              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                isAttending
                                  ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                                  : 'border-neutral-200 bg-white opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                    isAttending
                                      ? 'bg-neutral-900 border-neutral-900 text-white'
                                      : 'border-neutral-300 bg-white'
                                  }`}
                                >
                                  {isAttending && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-neutral-900">{c.title}</div>
                                  <div className="text-[10px] text-neutral-500 font-medium">
                                    {c.date} • {c.time} • <span className="font-semibold text-neutral-700">{c.mealType}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-200/80 text-neutral-700">
                                {c.dressCode}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Food Preference (Exact Reel Frame 30.5s) */}
                  <div className="space-y-3 pt-2">
                    <div className="text-center">
                      <h3 className="text-sm font-black tracking-tight text-neutral-950 uppercase">
                        {t.dietPreference}
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        {t.dietSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Vegetarian Card */}
                      <button
                        type="button"
                        onClick={() => setDiet('veg')}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                          diet === 'veg'
                            ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-950'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="veg-badge" />
                          {diet === 'veg' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{t.veg}</div>
                          <div className={`text-[9px] mt-0.5 ${diet === 'veg' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {t.vegDesc}
                          </div>
                        </div>
                      </button>

                      {/* Non-Vegetarian Card */}
                      <button
                        type="button"
                        onClick={() => setDiet('non-veg')}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                          diet === 'non-veg'
                            ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-950'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="non-veg-badge" />
                          {diet === 'non-veg' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{t.nonVeg}</div>
                          <div className={`text-[9px] mt-0.5 ${diet === 'non-veg' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {t.nonVegDesc}
                          </div>
                        </div>
                      </button>

                      {/* Strict Jain Card */}
                      <button
                        type="button"
                        onClick={() => setDiet('jain')}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                          diet === 'jain'
                            ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-950'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="jain-badge" />
                          {diet === 'jain' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{t.jain}</div>
                          <div className={`text-[9px] mt-0.5 ${diet === 'jain' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {t.jainDesc}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Expected Arrival Time with Minimalist Clock Face */}
                  <div className="pt-2 border-t border-neutral-100">
                    <ArrivalClock selectedTime={arrivalTime} onChange={setArrivalTime} />
                  </div>

                  {/* Sangeet Song Request */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-neutral-700" />
                      {t.songRequest}
                    </label>
                    <input
                      type="text"
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder={t.songPlaceholder}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition bg-white/90"
                    />
                  </div>
                </div>
              )}

              {/* If Declined, show message box */}
              {status === 'declined' && (
                <div className="space-y-3 pt-4 border-t border-neutral-100 animate-slide-up">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {t.blessingsPrompt}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.blessingsPlaceholder}
                    rows={3}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition bg-white/90"
                  />
                </div>
              )}

              {/* Shimmer Button for Confirmation */}
              {status && (
                <div className="pt-4">
                  <ShimmerButton
                    type="submit"
                    disabled={isSubmitting}
                    shimmerColor="#f59e0b"
                    shimmerSize="0.1em"
                    borderRadius="16px"
                    background="#09090b"
                    className="w-full py-3.5 text-xs font-bold tracking-widest uppercase shadow-xl"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4 text-amber-300" />
                        <span>{status === 'confirmed' ? t.submitConfirm : t.submitDecline}</span>
                      </div>
                    )}
                  </ShimmerButton>
                </div>
              )}
            </form>
          ) : (
            /* Confirmation Success Card */
            <div className="text-center py-6 space-y-6 animate-fade-in my-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg ring-8 ring-emerald-50">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-600 uppercase">
                  {t.successTitle}
                </span>
                <h2 className="text-2xl font-black text-neutral-950">
                  {status === 'confirmed'
                    ? `${t.successConfirmed}, ${guest.name.split(' ')[0]}!`
                    : `${t.successDeclined}, ${guest.name.split(' ')[0]}!`}
                </h2>
                {status === 'confirmed' ? (
                  <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                    We've reserved {attendingCount} {attendingCount === 1 ? 'plate' : 'plates'} ({diet?.toUpperCase()}) for your party. Expected around {arrivalTime}.
                  </p>
                ) : (
                  <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                    Your message and love have been forwarded directly to Aarav &amp; Riya.
                  </p>
                )}
              </div>

              {status === 'confirmed' && (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-sm text-left space-y-2 text-xs">
                    <div className="font-bold text-neutral-900">{event.eventTitle}</div>
                    <div className="text-neutral-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="text-neutral-600 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{event.venue}, {event.city}</span>
                    </div>
                  </div>

                  {/* Digital Wedding Gate Pass & Valet QR Access CTA */}
                  <button
                    type="button"
                    onClick={() => setIsPassModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>{t.viewGatePass}</span>
                  </button>
                </div>
              )}

              <div className="space-y-2 pt-2">
                {status === 'confirmed' && (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold tracking-wider uppercase hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    {t.venueDirections}
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 text-neutral-400 hover:text-neutral-800 text-xs font-medium transition"
                >
                  {t.changeRSVP}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding from Reel */}
        <div className="py-3 px-6 bg-white/90 border-t border-neutral-100 text-center text-[10px] tracking-wider text-neutral-400 uppercase font-semibold backdrop-blur-sm">
          {t.footerBranding}
        </div>
      </BackgroundPattern>

      {/* Digital Gate Pass & Valet QR Modal */}
      <DigitalGatePassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        guest={guest}
        event={event}
      />
    </>
  );
};
