import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  workoutsRepo,
  type WorkoutSetInput,
  type WorkoutStartInput,
} from '@/db/repos/workouts';
import type { WorkoutSet } from '@/db/schema';
import { queryKeys } from './query-keys';

export function useWorkouts(limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.workouts.list(), limit],
    queryFn: () => workoutsRepo.list(limit),
  });
}

export function useCurrentWorkout() {
  return useQuery({
    queryKey: queryKeys.workouts.current(),
    queryFn: () => workoutsRepo.current(),
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts.detail(id ?? ''),
    queryFn: () => (id ? workoutsRepo.get(id) : undefined),
    enabled: !!id,
  });
}

export function useWorkoutSets(workoutId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts.sets(workoutId ?? ''),
    queryFn: () => (workoutId ? workoutsRepo.setsOf(workoutId) : []),
    enabled: !!workoutId,
  });
}

export function useLastSetsForExercise(exerciseId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.workouts.lastSets(exerciseId ?? ''), limit],
    queryFn: () =>
      exerciseId ? workoutsRepo.lastSetsForExercise(exerciseId, limit) : [],
    enabled: !!exerciseId,
  });
}

export function useStartWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkoutStartInput = {}) => workoutsRepo.start(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workouts.all }),
  });
}

export function useFinishWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutsRepo.finish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workouts.all }),
  });
}

export function useAddSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkoutSetInput) => workoutsRepo.addSet(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.workouts.sets(vars.workoutId) });
      qc.invalidateQueries({ queryKey: queryKeys.workouts.lastSets(vars.exerciseId) });
    },
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<WorkoutSet, 'id'>> }) =>
      workoutsRepo.updateSet(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workouts.all }),
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; workoutId: string }) =>
      workoutsRepo.removeSet(id),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.workouts.sets(vars.workoutId) }),
  });
}
