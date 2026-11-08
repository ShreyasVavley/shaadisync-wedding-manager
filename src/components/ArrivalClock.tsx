import React from 'react';

interface ArrivalClockProps {
  selectedTime: string; // e.g. "07:00 PM"
  onChange: (time: string) => void;
  readOnly?: boolean;
}

const AVAILABLE_TIMES = [
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
];

export const ArrivalClock: React.FC<ArrivalClockProps> = ({
  selectedTime,
  onChange,
  readOnly = false,
}) => {
  // Parse hours and minutes to compute clock hand angles
  const parseAngles = (timeStr: string) => {
    const [time] = timeStr.split(' ');
    const [hourStr, minStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    if (hour === 12) hour = 0;

    const minuteAngle = min * 6; // 360 / 60
    const hourAngle = (hour % 12) * 30 + min * 0.5; // 360 / 12 + min shift
    return { hourAngle, minuteAngle };
  };

  const { hourAngle, minuteAngle } = parseAngles(selectedTime || '07:00 PM');

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="text-[10px] tracking-[0.25em] font-extrabold text-amber-400 uppercase mb-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        EXPECTED ARRIVAL TIME
      </div>

      {/* Luxury Timepiece Clock Face */}
      <div className="relative w-44 h-44 rounded-full border-2 border-amber-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] my-2 ring-4 ring-neutral-900">
        {/* Subtle inner gold rim */}
        <div className="absolute inset-2 rounded-full border border-amber-500/20 pointer-events-none" />

        {/* 12 Hour tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <div
            key={deg}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-between pointer-events-none py-1.5"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div
              className={`w-[1.5px] rounded-full ${
                deg % 90 === 0
                  ? 'h-3.5 bg-gradient-to-b from-amber-300 to-amber-500'
                  : 'h-1.5 bg-amber-500/40'
              }`}
            />
            <div
              className={`w-[1.5px] rounded-full ${
                deg % 90 === 0
                  ? 'h-3.5 bg-gradient-to-t from-amber-300 to-amber-500'
                  : 'h-1.5 bg-amber-500/40'
              }`}
            />
          </div>
        ))}

        {/* Center Pivot with Ruby Dot */}
        <div className="absolute w-3 h-3 rounded-full bg-amber-400 z-20 shadow-[0_0_8px_rgba(245,158,11,0.8)] ring-2 ring-neutral-900 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-rose-600" />
        </div>

        {/* Hour Hand */}
        <div
          className="absolute w-1.5 bg-gradient-to-t from-amber-500 to-amber-200 rounded-full origin-bottom z-10 transition-transform duration-500 ease-out shadow-sm"
          style={{
            height: '42px',
            top: 'calc(50% - 42px)',
            left: 'calc(50% - 3px)',
            transform: `rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-1 bg-gradient-to-t from-amber-400 to-yellow-100 rounded-full origin-bottom z-10 transition-transform duration-500 ease-out shadow-sm"
          style={{
            height: '62px',
            top: 'calc(50% - 62px)',
            left: 'calc(50% - 2px)',
            transform: `rotate(${minuteAngle}deg)`,
          }}
        />
      </div>

      {/* Large Digital Display with Gold Foil styling */}
      <div className="text-4xl font-black tracking-tight gold-foil-text font-mono mt-3 mb-1 drop-shadow-sm">
        {selectedTime}
      </div>

      {!readOnly && (
        <>
          <div className="text-[10px] tracking-wider uppercase text-neutral-400 font-semibold mb-3">
            Touch to adjust your estimated arrival
          </div>

          {/* Time Picker Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {AVAILABLE_TIMES.map((time) => {
              const active = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onChange(time)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 border-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-neutral-900/80 text-neutral-300 border-neutral-700/80 hover:border-amber-500/40 hover:text-white'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
