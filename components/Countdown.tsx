"use client";

import { useState, useEffect } from "react";

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Días", value: time.days },
    { label: "Horas", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Seg", value: time.seconds },
  ];

  return (
    <div className="flex gap-3">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-surface border border-border rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center relative overflow-hidden">
            <span className="font-sora font-extrabold text-2xl md:text-3xl text-teal">
              {pad(value)}
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border/50" />
          </div>
          <span className="text-[10px] text-text-muted mt-1.5 font-medium uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
}
