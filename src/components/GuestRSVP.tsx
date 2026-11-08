import React, { useState } from 'react';
import type { Guest, EventDetails, DietPreference } from '../types/wedding';
import { ArrivalClock } from './ArrivalClock';
import { ShimmerButton } from './ui/shimmer-button';
import { BackgroundPattern } from './ui/background-pattern';
import { SparklesCore } from './ui/sparkles';
import confetti from 'canvas-confetti';
import { Check, Calendar, MapPin, Music, Heart, ArrowLeft, Send, Sparkles } from 'lucide-react';

interface GuestRSVPProps {
  guest: Guest;
  event: EventDetails;
  onSubmitRSVP: (rsvpData: {
    guestId: string;
    status: 'confirmed' | 'declined';
    attendingCount: number;
    diet: DietPreference | null;
    arrivalTime: string | null;
    songRequest?: string;
    notes?: string;
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(guest.status !== 'pending');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      await onSubmitRSVP({
        guestId: guest.id,
        status,
        attendingCount: status === 'confirmed' ? attendingCount : 0,
        diet: status === 'confirmed' ? diet : null,
        arrivalTime: status === 'confirmed' ? arrivalTime : null,
        songRequest,
        notes,
      });

      if (status === 'confirmed') {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#fef08a', '#e11d48'],
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit RSVP. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundPattern
      variant="dots"
      spotlight={true}
      spotlightSize={320}
      className="w-full max-w-md mx-auto min-h-[740px] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-amber-500/30 flex flex-col justify-between overflow-hidden relative bg-gradient-to-b from-[#0b0b0f] via-[#111118] to-[#070709] text-white"
    >
      {/* Floating Gold Sparkle Embers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.8}
          particleDensity={25}
          particleColor="#fbbf24"
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 pt-5 px-6 pb-3 border-b border-amber-500/20 flex items-center justify-between text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase bg-neutral-950/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onBackToDashboard && !isStandalone && (
            <button
              onClick={onBackToDashboard}
              className="p-1 -ml-1 text-neutral-400 hover:text-amber-300 rounded-full hover:bg-neutral-800 transition"
              title="Return to Host Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            ROYAL WEDDING RSVP
          </span>
        </div>
        <span className="text-amber-300 flex items-center gap-1 font-black">
          TAJ PALACE 🇮🇳
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto relative z-10">
        {/* Main Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invitation Header Monogram */}
            <div className="text-center py-2 space-y-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 font-bold">
                Together With Their Families
              </div>

              {/* Royal Wax Seal Monogram with Spinning Conic Gold Ray */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-600 opacity-60 blur-xs animate-spin-slow" />
                <div className="relative w-20 h-20 rounded-full royal-wax-seal flex flex-col items-center justify-center shadow-2xl border border-amber-400/50">
                  <span className="font-serif text-2xl font-black tracking-wider text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    A &amp; R
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-amber-300/90 font-bold -mt-0.5">
                    Est. 2026
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-serif font-black tracking-[0.18em] uppercase gold-foil-text">
                  Aarav &amp; Riya
                </h2>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-400/80" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-amber-300 font-bold">Lagan Patrika</span>
                  <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-400/80" />
                </div>
                <p className="text-sm text-neutral-200 pt-1 font-medium">
                  Dear <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">{guest.name}</span>
                </p>
                <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 pt-0.5">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{event.date}</span>
                  <span>•</span>
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{event.venue}</span>
                </p>
              </div>
            </div>

            {/* Question 1: Will you attend? */}
            <div className="space-y-3 pt-2">
              <label className="block text-center text-sm font-black tracking-[0.2em] text-amber-300 uppercase">
                Will You Grace Us With Your Presence?
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAttendSelect('confirmed')}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 border shadow-lg ${
                    status === 'confirmed'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] scale-[1.02]'
                      : 'bg-neutral-900/90 text-neutral-200 border-neutral-700/80 hover:border-amber-500/40 hover:bg-neutral-800'
                  }`}
                >
                  {status === 'confirmed' && <Check className="w-4 h-4 stroke-[3]" />}
                  <span>YES, ATTENDING</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAttendSelect('declined')}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 border shadow-lg ${
                    status === 'declined'
                      ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white border-rose-500 ring-2 ring-rose-500/40 shadow-[0_0_20px_-3px_rgba(244,63,94,0.5)] scale-[1.02]'
                      : 'bg-neutral-900/90 text-neutral-200 border-neutral-700/80 hover:border-rose-500/40 hover:bg-neutral-800'
                  }`}
                >
                  {status === 'declined' && <Check className="w-4 h-4 stroke-[3]" />}
                  <span>CANNOT MAKE IT</span>
                </button>
              </div>
            </div>

            {/* If Confirmed, show details */}
            {status === 'confirmed' && (
              <div className="space-y-6 pt-4 border-t border-amber-500/20 animate-slide-up">
                {/* Number of Guests */}
                <div className="text-center space-y-2">
                  <div className="text-[10px] tracking-[0.25em] font-extrabold text-amber-400 uppercase">
                    CONFIRM TOTAL HEADCOUNT
                  </div>
                  <div className="flex items-center justify-center gap-6 py-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={attendingCount <= 1}
                      className="w-11 h-11 rounded-2xl border border-amber-500/40 bg-neutral-900 text-amber-300 flex items-center justify-center text-xl font-bold hover:bg-neutral-800 hover:border-amber-400 disabled:opacity-30 transition shadow-md active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-4xl font-black text-white w-14 text-center font-mono gold-foil-text drop-shadow-sm">
                      {attendingCount}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={attendingCount >= 8}
                      className="w-11 h-11 rounded-2xl border border-amber-500/40 bg-neutral-900 text-amber-300 flex items-center justify-center text-xl font-bold hover:bg-neutral-800 hover:border-amber-400 disabled:opacity-30 transition shadow-md active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                    Reserving <strong className="text-amber-300">{attendingCount}</strong> {attendingCount === 1 ? 'Plate' : 'Plates'}
                  </div>
                </div>

                {/* Food Preference (Exact Reel Frame 30.5s) */}
                <div className="space-y-3 pt-2">
                  <div className="text-center">
                    <h3 className="text-xs font-black tracking-[0.2em] text-amber-300 uppercase">
                      Select Catering Dietary Preference
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Enables zero-waste preparation fresh from the chef's kitchen
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Vegetarian Card */}
                    <button
                      type="button"
                      onClick={() => setDiet('veg')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-30 transition-all ${
                        diet === 'veg'
                          ? 'border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400'
                          : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="veg-badge ring-1 ring-emerald-500/40 shadow-sm" />
                        {diet === 'veg' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold leading-tight text-white">Pure Veg</div>
                        <div className="text-[9px] mt-0.5 text-neutral-400">
                          Paneer Tikka &amp; Dal Makhani
                        </div>
                      </div>
                    </button>

                    {/* Non-Vegetarian Card */}
                    <button
                      type="button"
                      onClick={() => setDiet('non-veg')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-30 transition-all ${
                        diet === 'non-veg'
                          ? 'border-rose-400 bg-rose-950/40 text-white shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)] ring-1 ring-rose-400'
                          : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="non-veg-badge ring-1 ring-rose-500/40 shadow-sm" />
                        {diet === 'non-veg' && <Check className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold leading-tight text-white">Non-Veg</div>
                        <div className="text-[9px] mt-0.5 text-neutral-400">
                          Butter Chicken &amp; Kebabs
                        </div>
                      </div>
                    </button>

                    {/* Strict Jain Card */}
                    <button
                      type="button"
                      onClick={() => setDiet('jain')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-30 transition-all ${
                        diet === 'jain'
                          ? 'border-amber-400 bg-amber-950/40 text-white shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] ring-1 ring-amber-400'
                          : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="jain-badge ring-1 ring-amber-500/40 shadow-sm" />
                        {diet === 'jain' && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold leading-tight text-white">Strict Jain</div>
                        <div className="text-[9px] mt-0.5 text-neutral-400">
                          No Onion / Garlic
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Expected Arrival Time with Minimalist Clock Face */}
                <div className="pt-2 border-t border-amber-500/20">
                  <ArrivalClock selectedTime={arrivalTime} onChange={setArrivalTime} />
                </div>

                {/* Sangeet Song Request */}
                <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    Sangeet Song Request (Optional)
                  </label>
                  <input
                    type="text"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    placeholder="e.g. Gallan Goodiyaan, London Thumakda, Tauba Tauba"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900/90 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>
            )}

            {/* If Declined, show message box */}
            {status === 'declined' && (
              <div className="space-y-3 pt-4 border-t border-amber-500/20 animate-slide-up">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Send your warm blessings to Aarav &amp; Riya
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="We will miss having you celebrate with us! Leave a blessing for the couple..."
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900/90 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            )}

            {/* 21st.dev Shimmer Button for Confirmation */}
            {status && (
              <div className="pt-4">
                <ShimmerButton
                  type="submit"
                  disabled={isSubmitting}
                  shimmerColor="#fbbf24"
                  shimmerSize="0.12em"
                  borderRadius="16px"
                  background="linear-gradient(135deg, #18181b 0%, #09090b 100%)"
                  className="w-full py-4 text-xs font-black tracking-[0.2em] uppercase shadow-2xl border border-amber-500/40"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 text-amber-300" />
                      <span className="text-amber-200">
                        {status === 'confirmed' ? 'Confirm RSVP & Reserve Plates' : 'Submit Warm Blessings'}
                      </span>
                    </div>
                  )}
                </ShimmerButton>
              </div>
            )}
          </form>
        ) : (
          /* Confirmation Success Card */
          <div className="text-center py-6 space-y-6 animate-fade-in my-auto">
            {/* Wax Seal Checkmark */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-md animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-2xl border-2 border-emerald-400">
                <Check className="w-10 h-10 stroke-[3] text-emerald-100" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-[0.25em] text-emerald-400 uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                RSVP RECORDED WITH TAJ PALACE CATERING
              </span>
              <h2 className="text-2xl font-serif font-black text-white">
                {status === 'confirmed'
                  ? `See you at the wedding, ${guest.name.split(' ')[0]}!`
                  : `Thank you for your blessings, ${guest.name.split(' ')[0]}!`}
              </h2>
              {status === 'confirmed' ? (
                <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
                  We've reserved <strong className="text-amber-300 font-bold">{attendingCount} {attendingCount === 1 ? 'plate' : 'plates'}</strong> ({diet?.toUpperCase()}) for your party. Expected arrival around <strong className="text-white font-mono">{arrivalTime}</strong>.
                </p>
              ) : (
                <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
                  Your heartfelt message and blessings have been forwarded directly to Aarav &amp; Riya.
                </p>
              )}
            </div>

            {status === 'confirmed' && (
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 shadow-xl text-left space-y-2.5 text-xs">
                <div className="font-serif font-black text-amber-300 text-sm tracking-wide">{event.eventTitle}</div>
                <div className="text-neutral-300 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{event.date} • {event.time}</span>
                </div>
                <div className="text-neutral-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{event.venue}, {event.city}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              {status === 'confirmed' && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-black tracking-wider uppercase hover:from-amber-400 hover:to-amber-500 transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  Open Venue Directions (Google Maps)
                </a>
              )}

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full py-2.5 text-neutral-400 hover:text-amber-300 text-xs font-semibold transition"
              >
                Change or Update RSVP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding from Reel */}
      <div className="py-3 px-6 bg-neutral-950/80 border-t border-amber-500/20 text-center text-[10px] tracking-widest text-amber-400/80 uppercase font-black backdrop-blur-md relative z-10 flex items-center justify-center gap-2">
        <span>SHAADISYNC</span>
        <span>•</span>
        <span>ZERO CATERING FOOD WASTAGE</span>
      </div>
    </BackgroundPattern>
  );
};
