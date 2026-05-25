import React, { useState, useEffect, useRef } from 'react';

export default function CountUp({ 
  end, 
  duration = 800, 
  decimals = 0, 
  prefix = "", 
  suffix = "" 
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      let t = elapsed / duration;
      
      if (t >= 1) t = 1;

      const progress = 1 - Math.pow(1 - t, 4);
      setDisplayValue(progress * end);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    setDisplayValue(0);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration]);

  const formattedValue = decimals === 0 
    ? Math.round(displayValue) 
    : displayValue.toFixed(decimals);

  return (
    <span>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
