import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/layout';
import { DashboardPage } from '@/pages/dashboard';
import { WorkoutLoggerPage } from '@/pages/workout-logger';
import { PlansPage } from '@/pages/plans';
import { PlanDetailPage } from '@/pages/plan-detail';
import { ExercisesPage } from '@/pages/exercises';
import { ProgressPage } from '@/pages/progress';
import { BodyPage } from '@/pages/body';
import { SettingsPage } from '@/pages/settings';
import { IntegrationsPage } from '@/pages/integrations';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workout" element={<WorkoutLoggerPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:id" element={<PlanDetailPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/integrations" element={<IntegrationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
