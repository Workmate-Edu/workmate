import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormGetValues } from "react-hook-form"
import type { ChildInfo, ParentFormData } from "./auth"
import type { Option } from "@/components/ui/multi-select"

export interface StepProps {
  register: UseFormRegister<ParentFormData>;
  setValue: UseFormSetValue<ParentFormData>;
  errors: FieldErrors<ParentFormData>;
  isSubmitting: boolean;
  getValues: UseFormGetValues<ParentFormData>;
  control: Control<ParentFormData>
}

export interface LearningPreferencesStepProps extends StepProps {
  interestedInLearning: boolean;
  setInterestedInLearning: (value: boolean) => void;
  selectedAreas: string[];
  setSelectedAreas: (value: string[]) => void;
  selectedSubjects: string[];
  setSelectedSubjects: (value: string[]) => void;
  availableSubjects: Option[];
  handleAreaToggle: (value: string) => void;
  handleSubjectToggle: (value: string) => void;
}

export interface ChildrenStepProps extends StepProps {
  children: ChildInfo[];
  setChildren: (children: ChildInfo[]) => void;
}
