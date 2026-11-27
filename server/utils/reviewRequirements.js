const hasMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;

  return ![
    "",
    "none",
    "no",
    "n/a",
    "na",
    "not applicable",
    "not specified"
  ].includes(String(value).trim().toLowerCase());
};

export const hasProfessionalReviewRequirement = (client) => (
  Number(client.age) < 18 ||
  hasMeaningfulValue(client.medical_conditions) ||
  hasMeaningfulValue(client.injury_restrictions)
);

export const getProfessionalReviewReason = (client) => {
  if (Number(client.age) < 18) {
    return "A qualified professional must review this general draft before use.";
  }

  if (
    hasMeaningfulValue(client.medical_conditions) ||
    hasMeaningfulValue(client.injury_restrictions)
  ) {
    return "A qualified professional must review this general draft before use.";
  }

  return "";
};
