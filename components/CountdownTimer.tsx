"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Cerrado"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h`);
      } else {
        setTimeLeft(`${h}h ${m}m`);
      }
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isClosed = timeLeft === "Cerrado";

  return (
    <span className={`font-grotesk text-xs font-medium ${isClosed ? "text-danger" : "text-warning"}`}>
      {isClosed ? "Cerrado" : `Cierra en ${timeLeft}`}
    </span>
  );
}
