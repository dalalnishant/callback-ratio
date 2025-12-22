import { ApplicationStatus, getGhostingPhase, GhostingPhase, type JobApplication } from './application.js';

export interface ApplicationMetrics {
  total: number;
  callbacks: number;
  interviews: number;
  offers: number;
  rejections: number;
  ghosted: number;

  callbackRatio: number;
  interviewRatio: number;
  offerRatio: number;

  avgResponseTimeDays: number | null;
  ghostAfterCallbackRate: number;
  applicationsPerWeek: number;
}

export function deriveMetrics(
  applications: JobApplication[],
  now: Date = new Date()
) {
  const total = applications.length;

  const callbacks = applications.filter(
    a =>
      a.status === ApplicationStatus.CALLBACK ||
      a.status === ApplicationStatus.INTERVIEW ||
      a.status === ApplicationStatus.OFFER
  ).length;

  const interviews = applications.filter(
    a =>
      a.status === ApplicationStatus.INTERVIEW ||
      a.status === ApplicationStatus.OFFER
  ).length;

  const offers = applications.filter(
    a => a.status === ApplicationStatus.OFFER
  ).length;

  const rejections = applications.filter(
    a => a.status === ApplicationStatus.REJECTED
  ).length;

  // -------- Ghosting (phase-aware) --------

  const preResponseGhosted = applications.filter(
    a => getGhostingPhase(a, now) === GhostingPhase.PRE_RESPONSE
  ).length;

  const postCallbackGhosted = applications.filter(
    a => getGhostingPhase(a, now) === GhostingPhase.POST_CALLBACK
  ).length;

  const postInterviewGhosted = applications.filter(
    a => getGhostingPhase(a, now) === GhostingPhase.POST_INTERVIEW
  ).length;

  const ghosted =
    preResponseGhosted +
    postCallbackGhosted +
    postInterviewGhosted;

  // -------- Ratios --------

  const callbackRatio = total === 0 ? 0 : callbacks / total;
  const interviewRatio = callbacks === 0 ? 0 : interviews / callbacks;
  const offerRatio = interviews === 0 ? 0 : offers / interviews;

  // -------- Avg response time (apply → first callback) --------

  const responseTimes = applications
    .filter(a => a.firstCallbackDate)
    .map(a => {
      const applied = new Date(a.appliedDate).getTime();
      const callback = new Date(a.firstCallbackDate!).getTime();
      return (callback - applied) / (1000 * 60 * 60 * 24);
    });

  const avgResponseTimeDays =
    responseTimes.length === 0
      ? 0
      : responseTimes.reduce((a, b) => a + b, 0) /
      responseTimes.length;

  return {
    total,
    callbacks,
    interviews,
    offers,
    rejections,

    ghosted,
    preResponseGhosted,
    postCallbackGhosted,
    postInterviewGhosted,

    callbackRatio,
    interviewRatio,
    offerRatio,
    avgResponseTimeDays
  };
}
