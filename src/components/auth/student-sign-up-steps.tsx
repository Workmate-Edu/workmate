import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { BaseSignUpFields } from "./base-sign-up-form"
import { educationLevels, gradesByLevel } from "@/lib/constants/education"
import { genderOptions, ageGroups } from "@/lib/constants/general"
import type { StepProps } from "@/types/form"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export function BasicInfoStep({ register, errors, isSubmitting, setValue }: StepProps) {
  return (
    <div className="space-y-4">
      <BaseSignUpFields 
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />

      <div>
        <Label>Phone Number</Label>
        <div className="relative">
          <PhoneInput
            country={'ng'}
            inputProps={{
              name: 'phone',
              required: true,
            }}
            onChange={(value) => setValue('phone', `+${value}`)}
            disabled={isSubmitting}
            containerClass="w-full"
            inputClass="!pl-14 !w-full !h-10 !text-sm !rounded-md !border !border-input !bg-background !text-foreground"
            buttonClass="!border-0 !bg-transparent !absolute !left-3 !top-1/2 !-translate-y-1/2 z-10"
            dropdownClass="!bg-white !text-black !z-[1000]"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Gender</Label>
        <Select
          onValueChange={(value) => setValue("gender", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your gender..." />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div>
        <Label>Age Group</Label>
        <Select
          onValueChange={(value) => setValue("ageGroup", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your age group..." />
          </SelectTrigger>
          <SelectContent>
            {ageGroups.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.ageGroup && (
          <p className="text-sm text-red-500">{errors.ageGroup.message}</p>
        )}
      </div>
    </div>
  )
}

export function EducationStep({ 
  errors, 
  isSubmitting, 
  setValue,
  selectedLevel,
  setSelectedLevel,
  availableGrades 
}: StepProps & {
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  availableGrades: { value: string; label: string; }[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Education Level</Label>
        <Select
          onValueChange={(value) => {
            setSelectedLevel(value)
            setValue("educationLevel", value)
            setValue("grade", "") // Reset grade when level changes
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select education level..." />
          </SelectTrigger>
          <SelectContent>
            {educationLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.educationLevel && (
          <p className="text-sm text-red-500">{errors.educationLevel.message}</p>
        )}
      </div>

      {selectedLevel && (
        <div>
          <Label>Grade/Year Level</Label>
          <Select
            onValueChange={(value) => setValue("grade", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grade/year level..." />
            </SelectTrigger>
            <SelectContent>
              {availableGrades.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade && (
            <p className="text-sm text-red-500">{errors.grade.message}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function SubjectsStep({
  errors,
  isSubmitting,
  setValue,
  selectedAreas,
  setSelectedAreas,
  selectedSubjects,
  setSelectedSubjects,
  availableSubjects,
  handleAreaToggle,
  handleSubjectToggle,
  subjectAreas
}: StepProps & {
  selectedAreas: string[];
  setSelectedAreas: (value: string[]) => void;
  selectedSubjects: string[];
  setSelectedSubjects: (value: string[]) => void;
  availableSubjects: any[];
  handleAreaToggle: (value: string) => void;
  handleSubjectToggle: (value: string) => void;
  subjectAreas: any[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Subject Areas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAreas.map(area => {
            const areaData = subjectAreas.find(a => a.value === area)
            return (
              <Badge key={area} variant="secondary">
                {areaData?.label}
                <button
                  type="button"
                  className="ml-1"
                  onClick={() => handleAreaToggle(area)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
        <Select
          onValueChange={handleAreaToggle}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select subject areas..." />
          </SelectTrigger>
          <SelectContent>
            {subjectAreas.map((area) => (
              <SelectItem 
                key={area.value} 
                value={area.value}
              >
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subjectAreas && (
          <p className="text-sm text-red-500">{errors.subjectAreas.message}</p>
        )}
      </div>

      {selectedAreas.length > 0 && (
        <div>
          <Label>Subjects of Interest</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSubjects.map(subject => {
              const subjectData = availableSubjects.find(s => s.value === subject)
              return (
                <Badge key={subject} variant="secondary">
                  {subjectData?.label}
                  <button
                    type="button"
                    className="ml-1"
                    onClick={() => handleSubjectToggle(subject)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
          <Select
            onValueChange={handleSubjectToggle}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select subjects..." />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem 
                  key={subject.value} 
                  value={subject.value}
                  disabled={selectedSubjects.includes(subject.value)}
                >
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subjects && (
            <p className="text-sm text-red-500">{errors.subjects.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
