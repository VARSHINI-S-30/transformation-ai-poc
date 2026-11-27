
const versions = new Map();

const makeKey = ({ clientId, planType, month, week }) =>
  `${clientId}:${planType}:${month ?? "all"}:${week ?? "all"}`;

export const savePlanVersion = (details, plan) => {
  const key = makeKey(details);

  if (!versions.has(key)) {
    versions.set(key, []);
  }

  const history = versions.get(key);

  const entry = {
    version: history.length + 1,
    plan: structuredClone(plan),
    createdAt: new Date().toISOString(),
    changeNote: details.changeNote || "Initial saved version"
  };

  history.push(entry);
  return entry;
};

export const getPlanVersions = (details) => {
  return versions.get(makeKey(details)) || [];
};

export const getPlanVersion = (details, version) => {
  const history = getPlanVersions(details);
  return history.find((item) => item.version === Number(version)) || null;
};
