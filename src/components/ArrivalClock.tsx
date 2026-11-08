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
      <div className="text-[11px] tracking-[0.25em] font-semibold text-neutral-400 uppercase mb-4">
        EXPECTED ARRIVAL
      </div>

      {/* Clock Face - Matching minimalist line art from the reel */}
      <div className="relative w-44 h-44 rounded-full border-[1.5px] border-neutral-900 bg-white flex items-center justify-center shadow-sm my-2">
        {/* 12 Hour tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <div
            key={deg}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-between pointer-events-none"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div
              className={`w-[1.5px] bg-neutral-900 ${
                deg % 90 === 0 ? 'h-3.5' : 'h-1.5'
              }`}
            />
            <div
              className={`w-[1.5px] bg-neutral-900 ${
                deg % 90 === 0 ? 'h-3.5' : 'h-1.5'
              }`}
            />
          </div>
        ))}

        {/* Center Pivot */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-neutral-900 z-20" />

        {/* Hour Hand */}
        <div
          className="absolute w-1 bg-neutral-900 rounded-full origin-bottom z-10 transition-transform duration-500 ease-out"
          style={{
            height: '42px',
            top: 'calc(50% - 42px)',
            left: 'calc(50% - 2px)',
            transform: `rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-[1.5px] bg-neutral-900 rounded-full origin-bottom z-10 transition-transform duration-500 ease-out"
          style={{
            height: '62px',
            top: 'calc(50% - 62px)',
            left: 'calc(50% - 0.75px)',
            transform: `rotate(${minuteAngle}deg)`,
          }}
        />
      </div>

      {/* Large Digital Display - Exactly like in reel */}
      <div className="text-4xl font-extrabold tracking-tight text-neutral-950 mt-4 mb-2">
        {selectedTime}
      </div>

      {!readOnly && (
        <>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 inline-block" />
            SELECT EXPECTED REACHING TIME
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    active
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
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
