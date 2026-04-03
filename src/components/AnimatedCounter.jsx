import React, { useEffect, memo } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const AnimatedCounter = ({ from = 0, to, duration = 1.5, className }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [to, count, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default memo(AnimatedCounter);
