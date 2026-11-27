const monthlyPlans = new Map();

const createKey = (clientId, month) =>
  `${Number(clientId)}-${Number(month)}`;

export const saveMonthlyPlan = (clientId, month, plan) => {
  const key = createKey(clientId, month);
  monthlyPlans.set(key, plan);
  return plan;
};

export const getMonthlyPlan = (clientId, month) => {
  const key = createKey(clientId, month);
  return monthlyPlans.get(key) || null;
};

export const getAllMonthlyPlansForClient = (clientId) => {
  const prefix = `${Number(clientId)}-`;

  return Array.from(monthlyPlans.entries())
    .filter(([key]) => key.startsWith(prefix))
    .map(([, plan]) => plan);
};