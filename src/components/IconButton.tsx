"use client";

import type { ReactNode } from "react";

/**
 * A small icon-only control with a hit area big enough to hit.
 *
 * Five tools grew the same reorder/remove trio — merge PDF, merge audio, merge
 * video, images to PDF, organize PDF — and all five had settled on `p-1`
 * around a 12–14px glyph. That is a 20–22px target, below even the 24px floor
 * WCAG 2.5.8 sets, and on a phone it means missing the button and hitting the
 * row instead.
 *
 * The fix is padding rather than a bigger glyph, so the buttons look the same
 * as before and only the reachable area grows. Kept in one place because a
 * sixth copy of the same className is how the first five drifted apart.
 */

interface IconButtonProps {
  onClick: () => void;
  /** Required: these buttons have no text, so this is their only label. */
  label: string;
  children: ReactNode;
  disabled?: boolean;
  /** Red on hover — for remove/delete. */
  danger?: boolean;
  /**
   * 32px instead of 36px, for the thumbnail cards in Organize PDF where three
   * controls share a card that is only ~138px wide on a small phone.
   */
  compact?: boolean;
  /** Extra classes, e.g. a colour override for a toggled state. */
  className?: string;
}

export default function IconButton({
  onClick,
  label,
  children,
  disabled = false,
  danger = false,
  compact = false,
  className = "",
}: IconButtonProps) {
  const size = compact ? "h-8 w-8" : "h-9 w-9";
  const colour = className
    ? className
    : `text-ink-muted ${danger ? "hover:text-error" : "hover:text-ink"}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center ${size} rounded-md disabled:opacity-25 disabled:hover:text-ink-muted transition-colors ${colour}`}
    >
      {children}
    </button>
  );
}
