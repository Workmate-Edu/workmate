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
import { cn } from '@/lib/utils'

export function BasicInfoStep({ register, errors, isSubmitting, setValue }: StepProps) {
  return (
    <div className="space-y-4">
      <BaseSignUpFields 
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />

      <div className={cn("rounded-lg border border-transparent p-3", errors.phone && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.phone && "text-destructive")}>Phone Number</Label>
        <div className="relative">
          <PhoneInput
            country={'ng'}
            inputProps={{
              name: 'phone',
              required: true,
              'aria-invalid': Boolean(errors.phone),
            }}
            onChange={(value) => setValue('phone', `+${value}`)}
            disabled={isSubmitting}
            containerClass="w-full"
            inputClass={cn("!pl-14 !w-full !h-10 !text-sm !rounded-md !border !border-input !bg-background !text-foreground", errors.phone && "!border-destructive")}
            buttonClass="!border-0 !bg-transparent !absolute !left-3 !top-1/2 !-translate-y-1/2 z-10"
            dropdownClass="!bg-white !text-black !z-[1000]"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className={cn("rounded-lg border border-transparent p-3", errors.gender && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.gender && "text-destructive")}>Gender</Label>
        <Select
          onValueChange={(value) => setValue("gender", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger aria-invalid={Boolean(errors.gender)} className={cn("w-full", errors.gender && "border-destructive")}>
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

      <div className={cn("rounded-lg border border-transparent p-3", errors.ageGroup && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.ageGroup && "text-destructive")}>Age Group</Label>
        <Select
          onValueChange={(value) => setValue("ageGroup", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger aria-invalid={Boolean(errors.ageGroup)} className={cn("w-full", errors.ageGroup && "border-destructive")}>
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
      <div className={cn("rounded-lg border border-transparent p-3", errors.educationLevel && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.educationLevel && "text-destructive")}>Education Level</Label>
        <Select
          onValueChange={(value) => {
            setSelectedLevel(value)
            setValue("educationLevel", value)
            setValue("grade", "") // Reset grade when level changes
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger aria-invalid={Boolean(errors.educationLevel)} className={cn("w-full", errors.educationLevel && "border-destructive")}>
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
        <div className={cn("rounded-lg border border-transparent p-3", errors.grade && "border-destructive bg-destructive/5")}>
          <Label className={cn(errors.grade && "text-destructive")}>Grade/Year Level</Label>
          <Select
            onValueChange={(value) => setValue("grade", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger aria-invalid={Boolean(errors.grade)} className={cn("w-full", errors.grade && "border-destructive")}>
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
      <div className={cn("rounded-lg border border-transparent p-3", errors.subjectAreas && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.subjectAreas && "text-destructive")}>Subject Areas</Label>
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
          <SelectTrigger aria-invalid={Boolean(errors.subjectAreas)} className={cn("w-full", errors.subjectAreas && "border-destructive")}>
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
        <div className={cn("rounded-lg border border-transparent p-3", errors.subjects && "border-destructive bg-destructive/5")}>
          <Label className={cn(errors.subjects && "text-destructive")}>Subjects of Interest</Label>
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
            <SelectTrigger aria-invalid={Boolean(errors.subjects)} className={cn("w-full", errors.subjects && "border-destructive")}>
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
