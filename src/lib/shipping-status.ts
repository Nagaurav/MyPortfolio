import { CircleDot, Rocket, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * How far a project actually got.
 *
 * A portfolio reader's first question about anything impressive is whether it
 * is real. Free text answered that inconsistently ("deployed", "WIP", "runs on
 * my laptop"), so the status is a fixed set backed by a check constraint on
 * `projects.shipping_status`, and the nuance lives in `shipping_note`.
 *
 * Shared by the admin form's select, the project cards and the detail page so
 * the three can never disagree about what a status means or looks like.
 */
export const SHIPPING_STATUSES = ['shipped', 'partial', 'local'] as const;

export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];

export interface ShippingMeta {
  icon: LucideIcon;
  /** Badge text. */
  label: string;
  /** Shown under the select in the admin form, to make the choice unambiguous. */
  hint: string;
  /** Tailwind classes for the badge, light and dark. */
  badgeClass: string;
}

export const SHIPPING_META: Record<ShippingStatus, ShippingMeta> = {
  shipped: {
    icon: Rocket,
    label: 'Shipped',
    hint: 'Deployed and reachable by someone other than you.',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  partial: {
    icon: CircleDot,
    label: 'Partly shipped',
    hint: 'Some of it is live; the rest still runs locally.',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  },
  local: {
    icon: Wrench,
    label: 'Local only',
    hint: 'Runs on your machine; nothing is deployed yet.',
    badgeClass:
      'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300',
  },
};

/** Narrows the nullable free-text column to a status the UI can render. */
export function toShippingStatus(value: string | null | undefined): ShippingStatus | null {
  return value && (SHIPPING_STATUSES as readonly string[]).includes(value)
    ? (value as ShippingStatus)
    : null;
}
