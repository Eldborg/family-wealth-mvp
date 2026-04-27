/**
 * Feature flags for gradual beta rollout
 * Configure via environment variables or .env file
 */

export const featureFlags = {
  // Week 1: Core features
  INVITE_FAMILY_MEMBERS: process.env.FF_INVITE_MEMBERS === 'true',
  GOAL_SHARING: process.env.FF_GOAL_SHARING === 'true',
  ADVANCED_ANALYTICS: process.env.FF_ADVANCED_ANALYTICS === 'true',
  MOBILE_APP: process.env.FF_MOBILE_APP === 'true',
  BUDGET_PLANNING: process.env.FF_BUDGET_PLANNING === 'true',
  RECURRING_GOALS: process.env.FF_RECURRING_GOALS === 'true',
  GOAL_TEMPLATES: process.env.FF_GOAL_TEMPLATES === 'true',
  FAMILY_INSIGHTS: process.env.FF_FAMILY_INSIGHTS === 'true',
};

/**
 * Check if a feature is enabled
 * Usage: if (isFeatureEnabled('INVITE_FAMILY_MEMBERS')) { ... }
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Get all enabled features (for client)
 */
export function getEnabledFeatures(): Record<string, boolean> {
  return featureFlags;
}

/**
 * Rollout phases for gradual feature enablement
 */
export const rolloutPhases = {
  PHASE_1_CORE: {
    startDate: new Date('2026-05-06'),
    endDate: new Date('2026-05-12'),
    enabledFeatures: ['INVITE_FAMILY_MEMBERS'],
    description: 'Core features only - auth and basic goal management',
  },
  PHASE_2_COLLABORATION: {
    startDate: new Date('2026-05-13'),
    endDate: new Date('2026-05-19'),
    enabledFeatures: ['INVITE_FAMILY_MEMBERS', 'GOAL_SHARING'],
    description: 'Add family collaboration features',
  },
  PHASE_3_FULL_LAUNCH: {
    startDate: new Date('2026-05-20'),
    enabledFeatures: Object.keys(featureFlags),
    description: 'All features enabled for full launch',
  },
};

/**
 * Get the current rollout phase
 */
export function getCurrentRolloutPhase(): string {
  const now = new Date();

  if (now < rolloutPhases.PHASE_1_CORE.endDate) {
    return 'PHASE_1_CORE';
  } else if (now < rolloutPhases.PHASE_2_COLLABORATION.endDate) {
    return 'PHASE_2_COLLABORATION';
  } else {
    return 'PHASE_3_FULL_LAUNCH';
  }
}
