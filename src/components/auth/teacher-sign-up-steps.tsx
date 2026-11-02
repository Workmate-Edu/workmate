import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { BaseSignUpFields } from "./base-sign-up-form"
import { genderOptions } from "@/lib/constants/general"
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
    </div>
  )
}

export function SubjectsStep({
  errors,
  isSubmitting,
  setValue,
  selectedAreas,
  setSelectedAreas,
  subjectsByArea,
  setSubjectsByArea,
  handleAreaSelect,
  handleSubjectToggle,
  subjectAreas
}: StepProps & {
  selectedAreas: string[];
  setSelectedAreas: (value: string[]) => void;
  subjectsByArea: Record<string, string[]>;
  setSubjectsByArea: (value: Record<string, string[]>) => void;
  handleAreaSelect: (value: string) => void;
  handleSubjectToggle: (area: string, subject: string) => void;
  subjectAreas: any[];
}) {
  const hasError = Boolean(errors.subjectAreas || errors.subjects)
  return (
    <div className={cn("space-y-4 rounded-lg border border-transparent p-3", hasError && "border-destructive bg-destructive/5")}>
      <Label className={cn(hasError && "text-destructive")}>Subject Areas</Label>
      {selectedAreas.map(area => {
        const areaData = subjectAreas.find(a => a.value === area)
        return (
          <div key={area} className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{areaData?.label}</h4>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => handleAreaSelect(area)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {areaData?.subjects.map(subject => (
                <Badge
                  key={subject.value}
                  variant={subjectsByArea[area]?.includes(subject.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSubjectToggle(area, subject.value)}
                >
                  {subject.label}
                </Badge>
              ))}
            </div>
          </div>
        )
      })}

      <Select 
        onValueChange={handleAreaSelect}
        disabled={isSubmitting}
      >
        <SelectTrigger aria-invalid={hasError} className={cn(hasError && "border-destructive")}>
          <SelectValue placeholder="Add subject area..." />
        </SelectTrigger>
        <SelectContent>
          {subjectAreas.map(area => (
            <SelectItem 
              key={area.value} 
              value={area.value}
              disabled={selectedAreas.includes(area.value)}
            >
              {area.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.subjectAreas && <p className="text-sm text-destructive">{errors.subjectAreas.message}</p>}
      {errors.subjects && <p className="text-sm text-destructive">{errors.subjects.message}</p>}
    </div>
  )
}

export function QualificationsStep({
  register,
  errors,
  isSubmitting,
  setValue,
  qualifications
}: StepProps & {
  qualifications: { label: string; value: string; }[];
}) {
  return (
    <div className="space-y-4">
      <div className={cn("rounded-lg border border-transparent p-3", errors.experience && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.experience && "text-destructive")}>Years of Experience</Label>
        <Input type="number" min="0" aria-invalid={Boolean(errors.experience)} className={cn(errors.experience && "border-destructive")} {...register("experience")} />
        {errors.experience && (
          <p className="text-sm text-red-500">{errors.experience.message}</p>
        )}
      </div>

      <div className={cn("rounded-lg border border-transparent p-3", errors.education && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.education && "text-destructive")}>Educational Background</Label>
        <Select
          onValueChange={(value) => setValue("education", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger aria-invalid={Boolean(errors.education)} className={cn("w-full", errors.education && "border-destructive")}>
            <SelectValue placeholder="Select qualification..." />
          </SelectTrigger>
          <SelectContent>
            {qualifications.map((qualification) => (
              <SelectItem key={qualification.value} value={qualification.value}>
                {qualification.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.education && (
          <p className="text-sm text-red-500">{errors.education.message}</p>
        )}
      </div>

      <div className={cn("rounded-lg border border-transparent p-3", errors.bio && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.bio && "text-destructive")}>Professional Bio</Label>
        <Textarea 
          placeholder="Tell students about your teaching experience and style..."
          aria-invalid={Boolean(errors.bio)}
          className={cn("h-24", errors.bio && "border-destructive")}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>
    </div>
  )
}
