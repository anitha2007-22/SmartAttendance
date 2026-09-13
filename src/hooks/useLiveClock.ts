import { useState, useEffect } from 'react';

export function useLiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  let greeting = 'Good morning';
  let greetingTamil = 'காலை வணக்கம்';

  if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
    greetingTamil = 'மதிய வணக்கம்';
  } else if (hours >= 17 || hours < 5) {
    greeting = 'Good evening';
    greetingTamil = 'மாலை வணக்கம்';
  }

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedShortTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    now,
    greeting,
    greetingTamil,
    formattedTime,
    formattedShortTime,
    formattedDate,
    hours,
  };
}
