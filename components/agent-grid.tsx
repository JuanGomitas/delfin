"use client"

import { useState } from "react"
import { Agent } from "@/lib/types"
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
  Search,
  MessageSquare,
  Check
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  "search": <Search className="w-6 h-6" />,
  "building": <Building className="w-6 h-6" />,
  "code": <Code className="w-6 h-6" />,
  "bug": <Bug className="w-6 h-6" />,
  "shield": <Shield className="w-6 h-6" />,
  "git-branch": <GitBranch className="w-6 h-6" />,
  "palette": <Palette className="w-6 h-6" />,
}

interface AgentGridProps {
  agents: Agent[]
  onStartChat: (selectedAgents: Agent[]) => void
}

export function AgentGrid({ agents, onStartChat }: AgentGridProps) {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(agentId)) {
        newSet.delete(agentId)
      } else {
        newSet.add(agentId)
      }
      return newSet
    })
  }

  const handleStartChat = () => {
    const selected = agents.filter(a => selectedAgents.has(a.id))
    if (selected.length > 0) {
      onStartChat(selected)
      setSelectedAgents(new Set())
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Agentes CrewAI - Taller 1</h2>
            <p className="text-slate-400 mt-1">
              Conociendo agentes individuales especializados para el desarrollo de software
            </p>
          </div>
          {selectedAgents.size > 0 && (
            <Button 
              onClick={handleStartChat}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Iniciar Chat ({selectedAgents.size} agentes)
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgents.has(agent.id)
          return (
            <Card 
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`bg-[#0f2744] border-[#1e3a5f] hover:border-emerald-500/50 transition-all cursor-pointer group relative ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : ''
              }`}
            >
              {/* Selection indicator */}
              <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 transition-all ${
                isSelected 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-slate-500 bg-transparent'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${agent.color}20` }}
                  >
                    <div style={{ color: agent.color }}>
                      {iconMap[agent.icon] || <Bot className="w-6 h-6" />}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg text-white mt-3">{agent.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className="w-fit text-xs"
                  style={{ borderColor: agent.color, color: agent.color }}
                >
                  {agent.role}
                </Badge>
                <CardDescription className="text-slate-400 text-sm mt-2">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs bg-[#162d4a] text-slate-300 border-0"
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
