import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash } from "lucide-react"
import { useState } from "react"

interface QuestionOptionsProps {
  type: string;
  onChange?: (options: any[]) => void;
}

export function QuestionOptions({ type, onChange }: QuestionOptionsProps) {
  const [options, setOptions] = useState<any[]>([{ text: "", isCorrect: false }])

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = options.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: value }
      }
      return opt
    })
    setOptions(newOptions)
    onChange?.(newOptions)
  }

  if (type === "written") {
    return (
      <div>
        <Label>Expected Answer</Label>
        <Textarea 
          placeholder="Enter the expected answer or key points..."
          className="h-24"
        />
      </div>
    )
  }

  if (type === "true_false") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch
            id="correct-answer"
            onCheckedChange={(checked) => onChange?.([{ isCorrect: checked }])}
          />
          <Label htmlFor="correct-answer">
            Correct answer is "True"
          </Label>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Options</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, "text", e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <div className="flex items-center gap-2">
              <Switch
                id={`correct-${index}`}
                checked={option.isCorrect}
                onCheckedChange={(checked) => updateOption(index, "isCorrect", checked)}
              />
              <Label htmlFor={`correct-${index}`}>
                Correct answer
              </Label>
            </div>
          </div>
          {options.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
