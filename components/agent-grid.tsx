"use client"

import { Agent } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bot, 
  Code, 
  Shield, 
  Bug, 
  Palette, 
  GitBranch, 
  Building, 
  UserCheck,
  MessageSquare
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  "user-check": <UserCheck className="w-6 h-6" />,
  "building": <Building className="w-6 h-6" />,
  "code": <Code className="w-6 h-6" />,
  "bug": <Bug className="w-6 h-6" />,
  "shield": <Shield className="w-6 h-6" />,
  "git-branch": <GitBranch className="w-6 h-6" />,
  "palette": <Palette className="w-6 h-6" />,
}

interface AgentCardProps {
  agent: Agent
  onStartChat: (agent: Agent) => void
}

export function AgentCard({ agent, onStartChat }: AgentCardProps) {
  return (
    <Card className="bg-[#0f2744] border-[#1e3a5f] hover:border-emerald-500/50 transition-all cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${agent.color}20` }}
          >
            <div style={{ color: agent.color }}>
              {iconMap[agent.icon] || <Bot className="w-6 h-6" />}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: agent.color, color: agent.color }}
          >
            {agent.role}
          </Badge>
        </div>
        <CardTitle className="text-lg text-white mt-3">{agent.name}</CardTitle>
        <CardDescription className="text-slate-400 text-sm">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <p className="text-xs text-slate-500 font-medium">Capacidades:</p>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map((cap, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-xs bg-[#162d4a] text-slate-300 border-0"
              >
                {cap}
              </Badge>
            ))}
          </div>
        </div>
        <Button 
          onClick={() => onStartChat(agent)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Iniciar Chat
        </Button>
      </CardContent>
    </Card>
  )
}

export function AgentGrid() {
  const { agents, setSelectedAgent, setActiveTab } = useAppStore()

  const handleStartChat = (agent: Agent) => {
    setSelectedAgent(agent)
    setActiveTab("chat")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Agentes Disponibles</h2>
        <p className="text-slate-400 mt-1">
          Selecciona un agente para comenzar una conversacion especializada
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onStartChat={handleStartChat} />
        ))}
      </div>
    </div>
  )
}
