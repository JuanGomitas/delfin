"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  GitBranch, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Bot,
  Loader2
} from "lucide-react"
import { getWorkflows, createWorkflow, getWorkflowSteps } from "@/app/actions/actions"
import { Workflow, WorkflowStep } from "@/lib/types"
import { AGENTS } from "@/lib/agents"

export function WorkflowPanel() {
  const { workflows, setWorkflows, mvpContext } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await getWorkflows()
        setWorkflows(data)
      } catch (error) {
        console.error("Error loading workflows:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkflows()
  }, [setWorkflows])

  useEffect(() => {
    const loadSteps = async () => {
      if (selectedWorkflow) {
        const steps = await getWorkflowSteps(selectedWorkflow.id)
        setWorkflowSteps(steps)
      }
    }
    loadSteps()
  }, [selectedWorkflow])

  const handleCreateWorkflow = async () => {
    if (!mvpContext) {
      alert("Por favor, define el contexto MVP primero")
      return
    }
    
    setIsCreating(true)
    try {
      const newWorkflow = await createWorkflow({
        name: `WF-SDAI-${Date.now().toString(36).toUpperCase()}`,
        description: `Workflow para: ${mvpContext.name}`,
      })
      setWorkflows([newWorkflow, ...workflows])
    } catch (error) {
      console.error("Error creating workflow:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Completado</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-0">En ejecucion</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-0">Fallido</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-0">Pendiente</Badge>
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workflow List */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-white">Workflows</CardTitle>
                <CardDescription className="text-slate-400">
                  Orquestacion de agentes para desarrollo
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleCreateWorkflow}
              disabled={isCreating || !mvpContext}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Nuevo Workflow
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitBranch className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-white font-medium mb-2">No hay workflows</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Crea un nuevo workflow para orquestar los agentes en el desarrollo de tu MVP
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    isSelected={selectedWorkflow?.id === workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Workflow Details */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Detalles del Workflow</CardTitle>
          <CardDescription className="text-slate-400">
            {selectedWorkflow ? selectedWorkflow.name : "Selecciona un workflow para ver los detalles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedWorkflow ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Progreso</span>
                  <span className="text-white font-medium">{selectedWorkflow.progress}%</span>
                </div>
                <Progress value={selectedWorkflow.progress} className="h-2" />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Estado</span>
                {getStatusBadge(selectedWorkflow.status)}
              </div>

              {/* Current Phase */}
              {selectedWorkflow.currentPhase && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Fase actual</span>
                  <span className="text-white">{selectedWorkflow.currentPhase}</span>
                </div>
              )}

              {/* Agent Steps */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Agentes Participantes</h4>
                <div className="space-y-2">
                  {AGENTS.slice(0, 5).map((agent, index) => {
                    const step = workflowSteps.find((s) => s.agentId === agent.id)
                    return (
                      <AgentStepCard
                        key={agent.id}
                        agent={agent}
                        step={step}
                        order={index + 1}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">
                Selecciona un workflow de la lista para ver sus detalles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WorkflowCard({
  workflow,
  isSelected,
  onClick,
  getStatusBadge,
}: {
  workflow: Workflow
  isSelected: boolean
  onClick: () => void
  getStatusBadge: (status: string) => React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "bg-emerald-500/10 border-emerald-500/50"
          : "bg-[#162d4a] border-[#1e3a5f] hover:border-emerald-500/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-violet-400" />
          <span className="text-white font-medium">{workflow.name}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
      <p className="text-slate-400 text-sm mb-3">{workflow.description}</p>
      <div className="flex items-center justify-between">
        {getStatusBadge(workflow.status)}
        <div className="flex items-center gap-2">
          <Progress value={workflow.progress} className="w-16 h-1" />
          <span className="text-slate-500 text-xs">{workflow.progress}%</span>
        </div>
      </div>
    </div>
  )
}

function AgentStepCard({
  agent,
  step,
  order,
}: {
  agent: (typeof AGENTS)[0]
  step?: WorkflowStep
  order: number
}) {
  const getStepStatus = () => {
    if (!step) return "pending"
    return step.status
  }

  const status = getStepStatus()

  return (
    <div className="flex items-center gap-3 p-3 bg-[#162d4a] rounded-lg">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
      >
        {order}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{agent.name}</span>
          {status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {status === "in_progress" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          {status === "pending" && <Clock className="w-4 h-4 text-slate-500" />}
        </div>
        <p className="text-slate-500 text-xs">{step?.output || "Esperando..."}</p>
      </div>
    </div>
  )
}
