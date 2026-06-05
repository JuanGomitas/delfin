"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentGrid } from "@/components/agent-grid"
import { AgentChat } from "@/components/agent-chat"
import { MVPContextForm } from "@/components/mvp-context-form"
import { WorkflowPanel } from "@/components/workflow-panel"
import { UserSettings } from "@/components/user-settings"
import { useAppStore } from "@/lib/store"
import { AGENTS as agents } from "@/lib/agents"
import { 
  getChats, 
  getApprovals, 
  getWorkflows,
  getMVPContext,
  resolveApproval 
} from "@/app/actions/actions"
import { 
  Bot, 
  MessageSquare, 
  Lightbulb, 
  GitBranch, 
  Plus,
  Check,
  X,
  Clock
} from "lucide-react"
import type { Agent, Chat, Approval, Workflow, MVPContext } from "@/lib/types"

interface DashboardProps {
  user: {
    id: string
    name: string
    email: string
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("agents")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [mvpContext, setMvpContext] = useState<MVPContext | null>(null)
  const [loading, setLoading] = useState(true)

  const pendingApprovals = approvals.filter(a => a.status === "pending")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [chatsData, approvalsData, workflowsData, mvpData] = await Promise.all([
        getChats(),
        getApprovals(),
        getWorkflows(),
        getMVPContext()
      ])
      setChats(chatsData)
      setApprovals(approvalsData)
      setWorkflows(workflowsData)
      setMvpContext(mvpData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setSelectedChat(null)
    setActiveTab("chat")
  }

  const handleNewChat = () => {
    setSelectedAgent(null)
    setSelectedChat(null)
    setActiveTab("agents")
  }

  const handleSelectChat = (chat: Chat) => {
    const agent = agents.find(a => a.id === chat.agentId)
    if (agent) {
      setSelectedAgent(agent)
      setSelectedChat(chat)
      setActiveTab("chat")
    }
  }

  const handleChatCreated = (chat: Chat) => {
    setChats(prev => [chat, ...prev])
    setSelectedChat(chat)
  }

  const handleApprovalAction = async (approvalId: string, approved: boolean) => {
    try {
      await resolveApproval(approvalId, approved)
      setApprovals(prev => 
        prev.map(a => 
          a.id === approvalId 
            ? { ...a, status: approved ? "approved" : "rejected", resolvedAt: new Date() }
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ScrumDev AI</h1>
              <p className="text-sm text-muted-foreground">Sistema de Agentes Inteligentes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <UserSettings user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Historial de Chats
              </p>
              {chats.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No hay conversaciones aun
                </p>
              ) : (
                chats.map((chat) => {
                  const agent = agents.find(a => a.id === chat.agentId)
                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChat?.id === chat.id
                          ? "bg-primary/20 border border-primary/50"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: agent?.color || "#666" }}
                        >
                          {agent?.name.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {chat.title || agent?.name || "Chat"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Aprobaciones
                </p>
                <Badge variant="destructive" className="text-xs">
                  {pendingApprovals.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-40">
                {pendingApprovals.map((approval) => (
                  <div 
                    key={approval.id}
                    className="p-2 mb-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <p className="font-medium text-foreground text-xs mb-1 line-clamp-2">
                      {approval.title}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs flex-1 bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
                        onClick={() => handleApprovalAction(approval.id, true)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs flex-1 hover:bg-destructive/20 text-destructive border-destructive/50"
                        onClick={() => handleApprovalAction(approval.id, false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border px-6 py-2 bg-card">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agentes
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="mvp" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Contexto MVP
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Workflow
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="agents" className="flex-1 overflow-auto p-6 m-0">
              <AgentGrid 
                agents={agents} 
                onSelectAgent={handleSelectAgent}
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden p-0 m-0">
              {selectedAgent ? (
                <AgentChat 
                  agent={selectedAgent}
                  existingChat={selectedChat}
                  onChatCreated={handleChatCreated}
                  onClose={handleNewChat}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Selecciona un agente</p>
                    <p className="text-sm">
                      Ve a la pestana de Agentes para iniciar una conversacion
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mvp" className="flex-1 overflow-auto p-6 m-0">
              <MVPContextForm 
                existingContext={mvpContext}
                onSave={handleMvpSaved}
              />
            </TabsContent>

            <TabsContent value="workflow" className="flex-1 overflow-auto p-6 m-0">
              <WorkflowPanel 
                workflows={workflows}
                onWorkflowsUpdate={setWorkflows}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
