import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bodyMeasurementsRepo,
  type BodyMeasurementInput,
} from '@/db/repos/body-measurements';
import type { MeasurementMetric } from '@/db/schema';
import { queryKeys } from './query-keys';

export function useBodyMeasurements(metric: MeasurementMetric, limit = 100) {
  return useQuery({
    queryKey: [...queryKeys.body.byMetric(metric), limit],
    queryFn: () => bodyMeasurementsRepo.byMetric(metric, limit),
  });
}

export function useLatestMeasurement(metric: MeasurementMetric) {
  return useQuery({
    queryKey: queryKeys.body.latest(metric),
    queryFn: () => bodyMeasurementsRepo.latest(metric),
  });
}

export function useAddMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BodyMeasurementInput) => bodyMeasurementsRepo.add(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.body.all }),
  });
}

export function useDeleteMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bodyMeasurementsRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.body.all }),
  });
}
