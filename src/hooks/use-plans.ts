import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  plansRepo,
  type PlanDayInput,
  type PlanExerciseInput,
  type PlanInput,
} from '@/db/repos/plans';
import { queryKeys } from './query-keys';

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.list(),
    queryFn: () => plansRepo.list(),
  });
}

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plans.detail(id ?? ''),
    queryFn: () => (id ? plansRepo.get(id) : undefined),
    enabled: !!id,
  });
}

export function usePlanDays(planId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plans.days(planId ?? ''),
    queryFn: () => (planId ? plansRepo.daysOf(planId) : []),
    enabled: !!planId,
  });
}

export function usePlanDay(planDayId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plans.day(planDayId ?? ''),
    queryFn: () => (planDayId ? plansRepo.getDay(planDayId) : undefined),
    enabled: !!planDayId,
  });
}

export function usePlanDayExercises(planDayId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plans.dayExercises(planDayId ?? ''),
    queryFn: () => (planDayId ? plansRepo.exercisesOfDay(planDayId) : []),
    enabled: !!planDayId,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanInput) => plansRepo.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.plans.all }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.plans.all }),
  });
}

export function useAddPlanDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanDayInput) => plansRepo.addDay(input),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.plans.days(vars.planId) }),
  });
}

export function useAddPlanExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanExerciseInput) => plansRepo.addExercise(input),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: queryKeys.plans.dayExercises(vars.planDayId),
      }),
  });
}
