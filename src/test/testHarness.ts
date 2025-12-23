import { ApplicationStatus, getGhostingPhase, type JobApplication } from '../domain/application.js';

import { deriveMetrics } from '../domain/metrics.js';

const NOW = new Date('2025-12-21T00:00:00Z');

function daysAgo(days: number): string {
    return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const applications: JobApplication[] = [
    // ---------- PRE-RESPONSE GHOST ----------
    {
        id: 'A1',
        company: 'Silent Corp',
        role: 'Frontend Dev',
        techTags: ['React'],
        source: 'LinkedIn',
        status: ApplicationStatus.APPLIED,
        appliedDate: daysAgo(30),
        lastUpdated: daysAgo(30),
    },

    // ---------- POST-CALLBACK GHOST ----------
    {
        id: 'A2',
        company: 'Callback Then Vanish LLC',
        role: 'Backend Dev',
        techTags: ['Java'],
        source: 'Referral',
        status: ApplicationStatus.CALLBACK,
        appliedDate: daysAgo(40),
        firstCallbackDate: daysAgo(25),
        lastUpdated: daysAgo(25),
    },

    // ---------- POST-INTERVIEW GHOST ----------
    {
        id: 'A3',
        company: 'Interview Ghost Inc',
        role: 'Fullstack Dev',
        techTags: ['Angular'],
        source: 'Other',
        status: ApplicationStatus.INTERVIEW,
        appliedDate: daysAgo(50),
        firstCallbackDate: daysAgo(35),
        firstInterviewDate: daysAgo(25),
        lastUpdated: daysAgo(25),
    },

    // ---------- ACTIVE (NOT GHOSTED) ----------
    {
        id: 'A4',
        company: 'Active Process Ltd',
        role: 'Engineer',
        techTags: ['TypeScript'],
        source: 'LinkedIn',
        status: ApplicationStatus.CALLBACK,
        appliedDate: daysAgo(5),
        firstCallbackDate: daysAgo(3),
        lastUpdated: daysAgo(3),
    },

    // ---------- REJECTED (TERMINAL, NOT GHOSTED) ----------
    {
        id: 'A5',
        company: 'Fast Reject Co',
        role: 'Dev',
        techTags: ['Node'],
        source: 'Other',
        status: ApplicationStatus.REJECTED,
        appliedDate: daysAgo(10),
        rejectionDate: daysAgo(4),
        lastUpdated: daysAgo(4),
    },
];

// ---------- Per-application phase verification ----------
console.log('\nGhosting Phase Check:\n');

for (const app of applications) {
    console.log({
        id: app.id,
        status: app.status,
        ghostingPhase: getGhostingPhase(app, NOW),
    });
}

// ---------- Metrics verification ----------
console.log('\nDerived Metrics:\n');
console.log(deriveMetrics(applications, NOW));
