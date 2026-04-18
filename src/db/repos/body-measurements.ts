import { db, newId } from '../db';
import {
  LOCAL_USER_ID,
  type BodyMeasurement,
  type MeasurementMetric,
  type MeasurementSource,
} from '../schema';

export interface BodyMeasurementInput {
  metric: MeasurementMetric;
  value: number;
  measuredAt?: number;
  source?: MeasurementSource;
  externalId?: string | null;
}

export const bodyMeasurementsRepo = {
  async byMetric(metric: MeasurementMetric, limit = 100): Promise<BodyMeasurement[]> {
    return db.bodyMeasurements
      .where('[metric+measuredAt]')
      .between([metric, 0], [metric, Number.MAX_SAFE_INTEGER])
      .reverse()
      .limit(limit)
      .toArray();
  },

  async latest(metric: MeasurementMetric): Promise<BodyMeasurement | undefined> {
    return db.bodyMeasurements
      .where('[metric+measuredAt]')
      .between([metric, 0], [metric, Number.MAX_SAFE_INTEGER])
      .reverse()
      .first();
  },

  async add(input: BodyMeasurementInput): Promise<BodyMeasurement> {
    const now = Date.now();
    const row: BodyMeasurement = {
      id: newId(),
      userId: LOCAL_USER_ID,
      measuredAt: input.measuredAt ?? now,
      metric: input.metric,
      value: input.value,
      source: input.source ?? 'manual',
      externalId: input.externalId ?? null,
      createdAt: now,
    };
    await db.bodyMeasurements.add(row);
    return row;
  },

  async remove(id: string): Promise<void> {
    await db.bodyMeasurements.delete(id);
  },
};
