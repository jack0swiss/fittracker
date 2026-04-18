export const queryKeys = {
  exercises: {
    all: ['exercises'] as const,
    list: () => [...queryKeys.exercises.all, 'list'] as const,
    byCategory: (category: string) =>
      [...queryKeys.exercises.all, 'byCategory', category] as const,
    detail: (id: string) => [...queryKeys.exercises.all, 'detail', id] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: () => [...queryKeys.plans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.plans.all, 'detail', id] as const,
    days: (planId: string) => [...queryKeys.plans.all, 'days', planId] as const,
    dayExercises: (planDayId: string) =>
      [...queryKeys.plans.all, 'dayExercises', planDayId] as const,
  },
  workouts: {
    all: ['workouts'] as const,
    list: () => [...queryKeys.workouts.all, 'list'] as const,
    current: () => [...queryKeys.workouts.all, 'current'] as const,
    detail: (id: string) => [...queryKeys.workouts.all, 'detail', id] as const,
    sets: (workoutId: string) => [...queryKeys.workouts.all, 'sets', workoutId] as const,
    lastSets: (exerciseId: string) =>
      [...queryKeys.workouts.all, 'lastSets', exerciseId] as const,
  },
  body: {
    all: ['body'] as const,
    byMetric: (metric: string) => [...queryKeys.body.all, 'metric', metric] as const,
    latest: (metric: string) => [...queryKeys.body.all, 'latest', metric] as const,
  },
} as const;
