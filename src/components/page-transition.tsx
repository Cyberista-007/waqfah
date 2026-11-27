"use client";

import React from "react";

/**
 * Instant, zero-blocking page wrapper.
 * Avoids artificial exit delays and GPU-heavy blur transitions during navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 w-full">{children}</div>;
}
