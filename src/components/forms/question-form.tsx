import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, Upload, FileIcon, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Option {
  id: string;
  value: string;
}

interface FileAttachment {
  file: File;
  previewUrl: string;
  name: string;
  type: string;
  size: number;
}

interface QuestionFormProps {
  onAddQuestion: (question: any) => void;
  onCancel: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ onAddQuestion, onCancel }) => {
  const [type, setType] = React.useState<'multiple_choice' | 'text' | 'file'>('text')
  const [question, setQuestion] = React.useState("")
  const [options, setOptions] = React.useState<Option[]>([])
  const [correctAnswer, setCorrectAnswer] = React.useState("")
  const [points, setPoints] = React.useState(10)
  const [currentOption, setCurrentOption] = React.useState("")
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false)

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachment]);

  const addOption = () => {
    if (!currentOption.trim()) {
      toast.error("Option cannot be empty")
      return
    }

    const newOption = {
      id: `option-${Date.now()}`,
      value: currentOption.trim()
    }
    setOptions([...options, newOption])
    setCurrentOption("") // Reset input
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOption()
    }
  }

  const updateOption = (id: string, value: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, value } : opt
    ))
    // Update correct answer if it matches the old value
    if (correctAnswer === options.find(opt => opt.id === id)?.value) {
      setCorrectAnswer(value)
    }
  }

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id))
    // Clear correct answer if removed option was selected
    if (correctAnswer === options.find(opt => opt.id === id)?.value) {
      setCorrectAnswer("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAttachment({
        file,
        previewUrl,
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/assessments/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: data.secure_url
      }
    } catch (error) {
      toast.error("Failed to upload file")
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let fileData
      if (type === 'file' && attachment) {
        fileData = await handleFileUpload(attachment.file)
      }

      onAddQuestion({
        id: Date.now().toString(),
        type,
        question,
        options: type === 'multiple_choice' ? options.map(opt => opt.value) : undefined,
        correctAnswer: type !== 'file' ? correctAnswer : undefined,
        points,
        attachment: fileData
      })

      // Reset form
      setQuestion("")
      setOptions([])
      setCorrectAnswer("")
      setAttachment(null)
    } catch (error) {
      console.error('Question creation error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Question Type</Label>
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Answer</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="file">File Upload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          required
        />
      </div>

      {type === 'multiple_choice' && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex gap-2">
            <Input
              value={currentOption}
              onChange={(e) => setCurrentOption(e.target.value)}
              placeholder="Enter option"
              onKeyPress={handleKeyPress}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={!currentOption.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2 space-y-2">
            {options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-muted rounded-md">
                  {option.value}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOptions(options.filter(opt => opt.id !== option.id))
                    if (correctAnswer === option.value) {
                      setCorrectAnswer("")
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'multiple_choice' && options.length > 0 && (
        <div>
          <Label>Correct Answer</Label>
          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
            <SelectTrigger>
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === 'file' && (
        <div className="space-y-2">
          <Label>File Attachment</Label>
          {isUploading ? (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading file...</span>
            </div>
          ) : (
            attachment ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <FileIcon className="h-4 w-4" />
                <span className="flex-1 text-sm truncate">{attachment.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            )
          )}
          <p className="text-sm text-muted-foreground">
            Students will need to upload their answer file
          </p>
        </div>
      )}

      {type !== 'file' && (
        <div>
          <Label>Correct Answer</Label>
          {type === 'multiple_choice' ? (
            <Select 
              value={correctAnswer} 
              onValueChange={setCorrectAnswer}
              disabled={options.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter correct answer"
            />
          )}
        </div>
      )}

      <div>
        <Label>Points</Label>
        <Input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Question</Button>
      </div>
    </form>
  )
}
