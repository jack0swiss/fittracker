import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { exercisesRepo, type ExerciseInput } from '@/db/repos/exercises';
import type { Exercise } from '@/db/schema';
import { queryKeys } from './query-keys';

export function useExercises() {
  return useQuery({
    queryKey: queryKeys.exercises.list(),
    queryFn: () => exercisesRepo.list(),
  });
}

export function useExercisesByCategory(category: Exercise['category']) {
  return useQuery({
    queryKey: queryKeys.exercises.byCategory(category),
    queryFn: () => exercisesRepo.byCategory(category),
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(id ?? ''),
    queryFn: () => (id ? exercisesRepo.get(id) : undefined),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExerciseInput) => exercisesRepo.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.exercises.all }),
  });
}

export function useUpdateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ExerciseInput> }) =>
      exercisesRepo.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.exercises.all }),
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exercisesRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.exercises.all }),
  });
}
