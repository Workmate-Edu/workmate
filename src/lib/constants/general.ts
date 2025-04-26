export const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "undisclosed" },
] as const;

export const ageGroups = [
  { label: "Under 12", value: "under_12" },
  { label: "12-15", value: "12_15" },
  { label: "16-18", value: "16_18" },
  { label: "19-22", value: "19_22" },
  { label: "Above 22", value: "above_22" }
] as const;
