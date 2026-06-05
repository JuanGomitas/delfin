"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentGrid } from "@/components/agent-grid"
import { AgentChat } from "@/components/agent-chat"
import { MVPContextForm } from "@/components/mvp-context-form"
import { WorkflowPanel } from "@/components/workflow-panel"
import { UserSettings } from "@/components/user-settings"
import { AGENTS } from "@/lib/agents"
import { 
  getChats, 
  getApprovals, 
  getWorkflows,
  getMVPContext,
  resolveApproval,
  createChat
} from "@/app/actions/actions"
import { 
  Bot, 
  MessageSquare, 
  Lightbulb, 
  GitBranch, 
  Plus,
  Check,
  X,
  Clock,
  Users,
  LayoutDashboard,
  Settings,
  History,
  CheckSquare
} from "lucide-react"
import type { Agent, Chat, Approval, Workflow, MVPContext, ActiveAgent, AgentStatus } from "@/lib/types"

interface DashboardProps {
  user: {
    id: string
    name: string
    email: string
  }
}

type ViewType = 'chat' | 'agents' | 'workflows' | 'mvp' | 'approvals' | 'history' | 'settings'

export function Dashboard({ user }: DashboardProps) {
  const [activeView, setActiveView] = useState<ViewType>('agents')
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [mvpContext, setMvpContext] = useState<MVPContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([])

  const pendingApprovals = approvals.filter(a => a.status === "pending")

  useEffect(() => {
    loadData()
  }, [])

  // Update active agents based on selected agents and workflows
  useEffect(() => {
    const agents: ActiveAgent[] = AGENTS.map(agent => {
      const inWorkflow = workflows.some(w => w.status === 'in_progress')
      let status: AgentStatus = 'idle'
      
      if (selectedAgents.some(a => a.id === agent.id)) {
        status = 'active'
      } else if (inWorkflow) {
        status = 'pending'
      }
      
      return { agent, status }
    })
    setActiveAgents(agents)
  }, [selectedAgents, workflows])

  const loadData = async () => {
    try {
      const [chatsData, approvalsData, workflowsData, mvpData] = await Promise.all([
        getChats(),
        getApprovals(),
        getWorkflows(),
        getMVPContext()
      ])
      setChats(chatsData as Chat[])
      setApprovals(approvalsData as Approval[])
      setWorkflows(workflowsData as Workflow[])
      setMvpContext(mvpData as MVPContext | null)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (agents: Agent[]) => {
    try {
      const agentIds = agents.map(a => a.id)
      const chatId = await createChat(agentIds)
      setSelectedAgents(agents)
      setCurrentChatId(chatId)
      setActiveView('chat')
      await loadData()
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  const handleNewChat = () => {
    setSelectedAgents([])
    setCurrentChatId(null)
    setActiveView('agents')
  }

  const handleSelectChat = (chat: Chat) => {
    const agents = AGENTS.filter(a => chat.agentIds.includes(a.id))
    setSelectedAgents(agents)
    setCurrentChatId(chat.id)
    setActiveView('chat')
  }

  const handleApprovalAction = async (approvalId: number, approved: boolean) => {
    try {
      await resolveApproval(approvalId, approved)
      setApprovals(prev => 
        prev.map(a => 
          a.id === approvalId 
            ? { ...a, status: approved ? "approved" : "rejected" as const, updatedAt: new Date() }
            : a
        )
      )
    } catch (error) {
      console.error("Error handling approval:", error)
    }
  }

  const handleMvpSaved = (context: MVPContext) => {
    setMvpContext(context)
  }

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500'
      case 'running': return 'bg-amber-500'
      case 'pending': return 'bg-slate-400'
      default: return 'bg-slate-600'
    }
  }

  const getStatusLabel = (status: AgentStatus) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'running': return 'En ejecucion'
      case 'pending': return 'Pendiente'
      default: return 'Inactivo'
    }
  }

  return (
    <div className="flex h-screen bg-[#0a1929]">
      {/* Sidebar - Navigation */}
      <aside className="w-64 bg-[#0f2744] border-r border-[#1e3a5f] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ScrumDev AI</h1>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Chat
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <div className="space-y-1">
            <NavButton 
              icon={<MessageSquare className="h-4 w-4" />} 
              label="Chat" 
              active={activeView === 'chat'}
              onClick={() => setActiveView('chat')}
            />
            <NavButton 
              icon={<GitBranch className="h-4 w-4" />} 
              label="Workflows" 
              active={activeView === 'workflows'}
              onClick={() => setActiveView('workflows')}
            />
            <NavButton 
              icon={<Users className="h-4 w-4" />} 
              label="Agentes" 
              active={activeView === 'agents'}
              onClick={() => setActiveView('agents')}
            />
            <NavButton 
              icon={<CheckSquare className="h-4 w-4" />} 
              label="Aprobaciones" 
              active={activeView === 'approvals'}
              badge={pendingApprovals.length > 0 ? pendingApprovals.length : undefined}
              onClick={() => setActiveView('approvals')}
            />
            <NavButton 
              icon={<History className="h-4 w-4" />} 
              label="Historial" 
              active={activeView === 'history'}
              onClick={() => setActiveView('history')}
            />
            <NavButton 
              icon={<Settings className="h-4 w-4" />} 
              label="Configuracion" 
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <UserSettings user={user} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Central Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'agents' && (
            <AgentGrid agents={AGENTS} onStartChat={handleStartChat} />
          )}
          
          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col">
              {selectedAgents.length > 0 && currentChatId ? (
                <AgentChat 
                  agents={selectedAgents}
                  chatId={currentChatId}
                  onClose={handleNewChat}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-white">Chat con ScrumDev AI</p>
                    <p className="text-sm mt-2">
                      Hola! Soy ScrumDev AI. En que puedo ayudarte hoy?
                    </p>
                    <Button 
                      onClick={handleNewChat}
                      className="mt-4 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Seleccionar Agentes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'workflows' && (
            <div className="flex-1 overflow-auto p-6">
              <WorkflowPanel 
                workflows={workflows}
                onWorkflowsUpdate={setWorkflows}
              />
            </div>
          )}

          {activeView === 'mvp' && (
            <div className="flex-1 overflow-auto p-6">
              <MVPContextForm 
                existingContext={mvpContext}
                onSave={handleMvpSaved}
              />
            </div>
          )}

          {activeView === 'approvals' && (
            <div className="flex-1 overflow-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Aprobaciones</h2>
              {approvals.length === 0 ? (
                <p className="text-slate-400">No hay aprobaciones pendientes</p>
              ) : (
                <div className="space-y-4">
                  {approvals.map(approval => (
                    <div key={approval.id} className="bg-[#0f2744] border border-[#1e3a5f] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{approval.title}</h3>
                          {approval.description && (
                            <p className="text-sm text-slate-400 mt-1">{approval.description}</p>
                          )}
                          <Badge 
                            className={`mt-2 ${
                              approval.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              approval.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {approval.status === 'pending' ? 'Pendiente' : 
                             approval.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </Badge>
                        </div>
                        {approval.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprovalAction(approval.id, true)}
                              className="bg-emerald-500 hover:bg-emerald-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprovalAction(approval.id, false)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'history' && (
            <div className="flex-1 overflow-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Historial de Chats</h2>
              {chats.length === 0 ? (
                <p className="text-slate-400">No hay conversaciones guardadas</p>
              ) : (
                <div className="space-y-2">
                  {chats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className="w-full text-left p-4 bg-[#0f2744] border border-[#1e3a5f] rounded-lg hover:border-emerald-500/50 transition-all"
                    >
                      <p className="font-medium text-white">{chat.title || 'Chat sin titulo'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {chat.agentIds.length} agente(s) - {new Date(chat.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'settings' && (
            <div className="flex-1 overflow-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Configuracion</h2>
              <div className="bg-[#0f2744] border border-[#1e3a5f] rounded-lg p-6">
                <h3 className="font-medium text-white mb-4">Contexto MVP</h3>
                <MVPContextForm 
                  existingContext={mvpContext}
                  onSave={handleMvpSaved}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panels */}
        <aside className="w-72 bg-[#0f2744] border-l border-[#1e3a5f] flex flex-col overflow-hidden">
          {/* Workflows Activos */}
          <div className="p-4 border-b border-[#1e3a5f]">
            <h3 className="text-sm font-semibold text-white mb-3">Workflows Activos</h3>
            <ScrollArea className="max-h-40">
              {workflows.length === 0 ? (
                <p className="text-xs text-slate-400">No hay workflows activos</p>
              ) : (
                <div className="space-y-2">
                  {workflows.slice(0, 3).map(workflow => (
                    <div key={workflow.id} className="bg-[#162d4a] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-white">{workflow.workflowId}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(workflow.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{workflow.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${
                          workflow.status === 'in_progress' ? 'text-amber-400' :
                          workflow.status === 'completed' ? 'text-emerald-400' :
                          'text-slate-400'
                        }`}>
                          {workflow.status === 'in_progress' ? 'En ejecucion' :
                           workflow.status === 'completed' ? 'Completado' :
                           workflow.status === 'failed' ? 'Fallido' : 'Pendiente'}
                        </span>
                        {workflow.progress > 0 && (
                          <div className="flex-1 bg-[#1e3a5f] rounded-full h-1.5">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${workflow.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="text-xs text-emerald-400 mt-2 hover:underline">
                Ver todos los workflows
              </button>
            </ScrollArea>
          </div>

          {/* Agentes Activos */}
          <div className="p-4 border-b border-[#1e3a5f] flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-white mb-3">Agentes Activos</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {activeAgents.map(({ agent, status }) => (
                  <div key={agent.id} className="flex items-center gap-2 py-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                      <p className="text-xs text-slate-400 truncate">{agent.description.slice(0, 20)}...</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${
                        status === 'active' ? 'text-emerald-400' :
                        status === 'running' ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>
                        {getStatusLabel(status)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Aprobaciones Pendientes */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Aprobaciones Pendientes</h3>
              {pendingApprovals.length > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                  {pendingApprovals.length}
                </Badge>
              )}
            </div>
            <ScrollArea className="max-h-48">
              {pendingApprovals.length === 0 ? (
                <p className="text-xs text-slate-400">No hay aprobaciones pendientes</p>
              ) : (
                <div className="space-y-2">
                  {pendingApprovals.slice(0, 2).map(approval => (
                    <div key={approval.id} className="bg-[#162d4a] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-white font-medium line-clamp-2">{approval.title}</p>
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, true)}
                          className="h-6 text-xs flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovalAction(approval.id, false)}
                          className="h-6 text-xs flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      </main>
    </div>
  )
}

// Navigation Button Component
function NavButton({ 
  icon, 
  label, 
  active, 
  badge,
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-emerald-500/20 text-emerald-400' 
          : 'text-slate-300 hover:bg-[#162d4a] hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge className="ml-auto bg-red-500 text-white text-xs h-5 min-w-5 flex items-center justify-center">
          {badge}
        </Badge>
      )}
    </button>
  )
}
