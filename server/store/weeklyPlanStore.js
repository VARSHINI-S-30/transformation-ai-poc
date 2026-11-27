const weeklyPlans = new Map();

const createKey = (clientId, month, week) =>
  `${Number(clientId)}-${Number(month)}-${Number(week)}`;

export const saveWeeklyPlan = (clientId, month, week, plan) => {
  const key = createKey(clientId, month, week);
  weeklyPlans.set(key, plan);
  return plan;
};

export const getWeeklyPlan = (clientId, month, week) => {
  const key = createKey(clientId, month, week);
  return weeklyPlans.get(key) || null;
};

export const getAllWeeklyPlansForClient = (clientId) => {
  const prefix = `${Number(clientId)}-`;

  return Array.from(weeklyPlans.entries())
    .filter(([key]) => key.startsWith(prefix))
    .map(([, plan]) => plan);
};