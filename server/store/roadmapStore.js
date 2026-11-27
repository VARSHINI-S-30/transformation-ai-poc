const roadmaps = new Map();

export const saveRoadmap = (clientId, roadmap) => {
  roadmaps.set(Number(clientId), roadmap);
  return roadmap;
};

export const getRoadmapByClientId = (clientId) => {
  return roadmaps.get(Number(clientId)) || null;
};