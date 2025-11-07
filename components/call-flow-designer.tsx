'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { GripVertical, Plus, Trash2, Save } from 'lucide-react'

interface FlowStep {
  id: string
  step_type: 'greeting' | 'detection' | 'collection' | 'confirmation' | 'goodbye'
  step_order: number
  title: string
  prompt_text: string
  is_enabled: boolean
  fields_to_collect?: string[]
}

const stepTypes = [
  { value: 'greeting', label: 'Greeting' },
  { value: 'detection', label: 'Problem Detection' },
  { value: 'collection', label: 'Info Collection' },
  { value: 'confirmation', label: 'Confirmation' },
  { value: 'goodbye', label: 'Goodbye' },
]

export default function CallFlowDesigner({ agentId }: { agentId: string }) {
  const [steps, setSteps] = useState<FlowStep[]>([])
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null)

  useEffect(() => {
    fetch(`/api/agents/${agentId}/flow-steps`)
      .then(res => res.json())
      .then(data => setSteps(data.sort((a: FlowStep, b: FlowStep) => a.step_order - b.step_order)))
      .catch(console.error)
  }, [agentId])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(steps)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update step_order
    const updatedSteps = items.map((step, index) => ({
      ...step,
      step_order: index + 1,
    }))

    setSteps(updatedSteps)
  }

  const addStep = () => {
    const newStep: FlowStep = {
      id: `temp-${Date.now()}`,
      step_type: 'greeting',
      step_order: steps.length + 1,
      title: 'New Step',
      prompt_text: '',
      is_enabled: true,
      fields_to_collect: [],
    }
    setSteps([...steps, newStep])
    setEditingStep(newStep)
  }

  const updateStep = (stepId: string, updates: Partial<FlowStep>) => {
    setSteps(steps.map(step => step.id === stepId ? { ...step, ...updates } : step))
  }

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  const saveSteps = async () => {
    await fetch(`/api/agents/${agentId}/flow-steps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }),
    })
    alert('Flow steps saved!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Call Flow Designer</h2>
          <p className="text-white/60 mt-1">Design your AI agent's conversation flow</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addStep} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
          <Button onClick={saveSteps}>
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border-white/10 bg-white/5 ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-white/40 cursor-move" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{step.title}</CardTitle>
                              <p className="text-sm text-white/60 capitalize">{step.step_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={step.is_enabled}
                              onCheckedChange={(checked) =>
                                updateStep(step.id, { is_enabled: checked })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Step Type</Label>
                              <select
                                value={step.step_type}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    step_type: e.target.value as FlowStep['step_type'],
                                  })
                                }
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                              >
                                {stepTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={step.title}
                                onChange={(e) =>
                                  updateStep(step.id, { title: e.target.value })
                                }
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Prompt Text</Label>
                            <Textarea
                              value={step.prompt_text}
                              onChange={(e) =>
                                updateStep(step.id, { prompt_text: e.target.value })
                              }
                              placeholder="Enter the AI prompt for this step..."
                              className="bg-white/5 border-white/10 min-h-[100px]"
                            />
                          </div>
                          {step.step_type === 'collection' && (
                            <div className="space-y-2">
                              <Label>Fields to Collect (comma-separated)</Label>
                              <Input
                                value={step.fields_to_collect?.join(', ') || ''}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    fields_to_collect: e.target.value
                                      .split(',')
                                      .map((f) => f.trim())
                                      .filter(Boolean),
                                  })
                                }
                                placeholder="name, phone, item, quantity, address"
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {steps.length === 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-12 text-center">
            <p className="text-white/60 mb-4">No flow steps yet</p>
            <Button onClick={addStep} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

