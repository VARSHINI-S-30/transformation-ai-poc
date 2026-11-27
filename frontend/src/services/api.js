const API_BASE_URL = "http://localhost:5000/api";
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }
  return result;
}
const jsonOptions = (body = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

// Excel and clients
export const uploadExcel = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return request("/excel/upload", {
    method: "POST",
    body: formData
  });
};
export const getClients = () => request("/clients");
export const getClientDetails = (clientId) =>
  request(`/clients/${clientId}`);

// AI yearly roadmap
export const generateRoadmap = (clientId) =>
  request(`/transformation/generate/${clientId}`, jsonOptions());
export const getRoadmap = (clientId) =>
  request(`/transformation/roadmap/${clientId}`);

// AI monthly plan
export const generateMonthlyPlan = (clientId, month) =>
  request(
    `/monthly-plans/generate/${clientId}/${month}`,
    jsonOptions()
  );
export const getMonthlyPlan = (clientId, month) =>
  request(`/monthly-plans/${clientId}/${month}`);

// AI weekly plan
export const generateWeeklyPlan = (clientId, month, week) =>
  request(
    `/weekly-plans/generate/${clientId}/${month}/${week}`,
    jsonOptions()
  );
export const getWeeklyPlan = (clientId, month, week) =>
  request(`/weekly-plans/${clientId}/${month}/${week}`);

// What-if regeneration
export const regeneratePlan = (planType, clientId, details) =>
  request(
    `/what-if/${planType}/${clientId}`,
    jsonOptions(details)
  );

// Version history
export const getPlanVersions = (planType, clientId, details = {}) => {
  const params = new URLSearchParams();
  if (details.month != null) params.set("month", details.month);
  if (details.week != null) params.set("week", details.week);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(
    `/what-if/${planType}/${clientId}/versions${query}`
  );
};

// Coach reviews
export const submitCoachReview = (clientId, planType, details) =>
  request(
    `/reviews/${clientId}/${planType}`,
    jsonOptions(details)
  );
export const getCoachReviews = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.planType) params.set("planType", filters.planType);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/reviews${query}`);
};

// PDF and Excel reports
export const downloadReport = async (clientId, format, filters = {}) => {
  if (!["pdf", "excel"].includes(format)) {
    throw new Error("Report format must be pdf or excel.");
  }
  const params = new URLSearchParams();
  if (filters.month) params.set("month", filters.month);
  if (filters.week) params.set("week", filters.week);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(
    `${API_BASE_URL}/reports/${clientId}/${format}${query}`
  );
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Report download failed.");
  }
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download =
    `transformation-report-${clientId}.${format === "pdf" ? "pdf" : "xlsx"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};
