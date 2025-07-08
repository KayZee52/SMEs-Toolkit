"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedCounter({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const spring = useSpring(0, { damping: 50, stiffness: 200 });

  const display = useTransform(spring, (current) => {
    if (isCurrency) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(current);
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
