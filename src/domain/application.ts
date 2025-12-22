/* =========================
   Application Status
   ========================= */
export const ApplicationStatus = {
  APPLIED: 'APPLIED',
  CALLBACK: 'CALLBACK',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/* =========================
   Core Domain Entity
   ========================= */

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  techTags: string[];
  source: ApplicationSource;
  status: ApplicationStatus;
  appliedDate: string; // When the application was submitted
  lastUpdated: string; // Last status change timestamp

  firstCallbackDate?: string; // When status first became CALLBACK
  firstInterviewDate?: string; // When status first became INTERVIEW
  offerDate?: string; // When status first became OFFER
  rejectionDate?: string;
}

export type ApplicationSource =
  | 'LinkedIn'
  | 'Referral'
  | 'CareerPage'
  | 'Other';

/* =========================
   Status Transition Rules
   ========================= */

/**
 * Explicitly defines which status transitions are allowed.
 * This prevents invalid state changes and silent data corruption.
 */
export const VALID_STATUS_TRANSITIONS: Readonly<
  Record<ApplicationStatus, readonly ApplicationStatus[]>
> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.CALLBACK,
    ApplicationStatus.REJECTED,
  ],

  [ApplicationStatus.CALLBACK]: [
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ],

  [ApplicationStatus.INTERVIEW]: [
    ApplicationStatus.OFFER,
    ApplicationStatus.REJECTED,
  ],

  [ApplicationStatus.OFFER]: [],

  [ApplicationStatus.REJECTED]: [],
} as const;

/**
 * Guards status changes.
 * All status updates must pass through this check.
 */
export function canTransitionStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

/* =========================
   Ghosting Logic
   ========================= */

/**
 * Ghosting definition:
 * An application is considered ghosted if no response occurs
 * for GHOSTING_THRESHOLD_DAYS after the last meaningful employer action.
 *
 * Threshold is global across all phases by design.
 */
export const GHOSTING_THRESHOLD_DAYS = 14;

export const GhostingPhase = {
  PRE_RESPONSE: 'PRE_RESPONSE',
  POST_CALLBACK: 'POST_CALLBACK',
  POST_INTERVIEW: 'POST_INTERVIEW',
} as const;

export type GhostingPhase = (typeof GhostingPhase)[keyof typeof GhostingPhase];

/**
 * Determines whether an application should be considered ghosted.
 * Pure function — no side effects.
 */
const DAY_MS = 1000 * 60 * 60 * 24;

export function getGhostingPhase(
  app: JobApplication,
  now: Date = new Date(),
): GhostingPhase | null {
  const nowMs = now.getTime();

  // --- Pre-response ghosting ---
  if (app.status === ApplicationStatus.APPLIED && !app.firstCallbackDate) {
    const applied = new Date(app.appliedDate).getTime();
    if (Number.isNaN(applied)) {
      throw new Error('Invalid appliedDate');
    }

    if ((nowMs - applied) / DAY_MS >= GHOSTING_THRESHOLD_DAYS) {
      return GhostingPhase.PRE_RESPONSE;
    }
  }

  // --- Post-callback ghosting ---
  if (
    app.status === ApplicationStatus.CALLBACK &&
    app.firstCallbackDate &&
    !app.firstInterviewDate
  ) {
    const callback = new Date(app.firstCallbackDate).getTime();
    if (Number.isNaN(callback)) {
      throw new Error('Invalid firstCallbackDate');
    }

    if ((nowMs - callback) / DAY_MS >= GHOSTING_THRESHOLD_DAYS) {
      return GhostingPhase.POST_CALLBACK;
    }
  }

  // --- Post-interview ghosting ---
  if (
    app.status === ApplicationStatus.INTERVIEW &&
    app.firstInterviewDate &&
    !app.offerDate &&
    !app.rejectionDate
  ) {
    const interview = new Date(app.firstInterviewDate).getTime();
    if (Number.isNaN(interview)) {
      throw new Error('Invalid firstInterviewDate');
    }

    if ((nowMs - interview) / DAY_MS >= GHOSTING_THRESHOLD_DAYS) {
      return GhostingPhase.POST_INTERVIEW;
    }
  }

  return null;
}

/* =========================
   MVP Convenience Helpers
   ========================= */

/**
 * For MVP dashboards.
 * Safe: only counts silence after apply.
 */
export function isPreResponseGhosted(
  app: JobApplication,
  now: Date = new Date(),
): boolean {
  return getGhostingPhase(app, now) === GhostingPhase.PRE_RESPONSE;
}

/* =========================
   Domain-Level Helpers
   ========================= */

// All application status changes must go through transitionStatus.
// Direct status mutation is forbidden outside test setup.
/**
 * Applies a status transition safely.
 * Throws if the transition is invalid.
 */
export function transitionStatus(
  application: JobApplication,
  nextStatus: ApplicationStatus,
  now: Date = new Date(),
): JobApplication {
  if (!canTransitionStatus(application.status, nextStatus)) {
    throw new Error(
      `Invalid status transition: ${application.status} → ${nextStatus}`,
    );
  }

  const updated: JobApplication = {
    ...application,
    status: nextStatus,
    lastUpdated: now.toISOString(),
  };

  // Record milestone timestamps (only first occurrence)
  switch (nextStatus) {
    case ApplicationStatus.CALLBACK:
      if (!updated.firstCallbackDate)
        updated.firstCallbackDate = now.toISOString();
      break;
    case ApplicationStatus.INTERVIEW:
      if (!updated.firstInterviewDate)
        updated.firstInterviewDate = now.toISOString();
      break;
    case ApplicationStatus.OFFER:
      if (!updated.offerDate) updated.offerDate = now.toISOString();
      break;
  }

  return updated;
}
