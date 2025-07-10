"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  // Framer motion is removed, so we'll just display the value directly.
  // A simple animation can be added back with CSS if needed.
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    let formattedValue;
    if (isCurrency) {
      formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } else {
      formattedValue = value.toLocaleString();
    }
    setDisplayValue(formattedValue);
  }, [value, isCurrency]);

  return <span>{displayValue}</span>;
}
