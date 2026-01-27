'use client';

import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col space-y-1 relative z-10 pb-6">
      <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter drop-shadow-sm select-none">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h1>
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
        {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
