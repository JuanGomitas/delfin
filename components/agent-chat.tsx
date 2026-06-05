"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAppStore } from "@/lib/store"
import { useChat } from "@ai-sdk/react"
import { Agent, Message } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Bot, 
  Send, 
  Trash2, 
  Code, 
  Shield, 
  Bug, 
  Palette, 
  GitBranch, 
  Building, 
  UserCheck,
  User,
  Loader2
} from "lucide-react"
import { createChat, addMessage, getMessages, deleteChat } from "@/app/actions/actions"

const iconMap: Record<string, React.ReactNode> = {
  "user-check": <UserCheck className="w-5 h-5" />,
  "building": <Building className="w-5 h-5" />,
  "code": <Code className="w-5 h-5" />,
  "bug": <Bug className="w-5 h-5" />,
  "shield": <Shield className="w-5 h-5" />,
  "git-branch": <GitBranch className="w-5 h-5" />,
  "palette": <Palette className="w-5 h-5" />,
}

interface AgentChatProps {
  agent: Agent
}

export function AgentChat({ agent }: AgentChatProps) {
  const [chatId, setChatId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [localMessages, setLocalMessages] = useState<Array<{ role: string; content: string }>>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { activeChat, setActiveChat, setActiveTab, setSelectedAgent } = useAppStore()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      agentId: agent.id,
      systemPrompt: agent.systemPrompt,
    },
    onFinish: async (message) => {
      if (chatId) {
        await saveMessage({
          chatId,
          role: "assistant",
          content: message.content,
          agentId: agent.id,
        })
      }
    },
  })

  // Initialize chat on mount
  useEffect(() => {
    const initChat = async () => {
      if (isInitializing || chatId) return
      setIsInitializing(true)
      try {
        const newChatId = await createChat(agent.id, `Chat con ${agent.name}`)
        setChatId(newChatId)
      } catch (error) {
        console.error("Error creating chat:", error)
      } finally {
        setIsInitializing(false)
      }
    }
    initChat()
  }, [agent.id, agent.name, chatId, isInitializing])

  // Load existing messages when chat is set
  useEffect(() => {
    const loadMessages = async () => {
      if (chatId) {
        const existingMessages = await getMessages(chatId)
        if (existingMessages.length > 0) {
          setMessages(existingMessages.map(m => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })))
        }
      }
    }
    loadMessages()
  }, [chatId, setMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !chatId) return
    
    // Save user message to database
    await addMessage({
      chatId,
      role: "user",
      content: input,
      agentId: agent.id,
    })
    
    handleSubmit(e)
  }

  const handleDeleteChat = async () => {
    if (chatId) {
      await deleteChat(chatId)
      setChatId(null)
      setMessages([])
      setSelectedAgent(null)
      setActiveTab("agents")
    }
  }

  return (
    <Card className="h-full flex flex-col bg-[#0f2744] border-[#1e3a5f]">
      <CardHeader className="border-b border-[#1e3a5f] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${agent.color}20` }}
            >
              <div style={{ color: agent.color }}>
                {iconMap[agent.icon] || <Bot className="w-5 h-5" />}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
              <Badge 
                variant="outline" 
                className="text-xs mt-1"
                style={{ borderColor: agent.color, color: agent.color }}
              >
                {agent.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteChat}
            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                <div style={{ color: agent.color }}>
                  {iconMap[agent.icon] || <Bot className="w-8 h-8" />}
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Inicia una conversacion con {agent.name}
              </h3>
              <p className="text-slate-400 text-sm max-w-md">
                Este agente puede ayudarte con: {agent.capabilities.join(", ")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className={message.role === "user" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-700 text-slate-300"
                      }
                      style={message.role === "assistant" ? { backgroundColor: `${agent.color}20`, color: agent.color } : {}}
                    >
                      {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-emerald-500 text-white"
                        : "bg-[#162d4a] text-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                    >
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#162d4a] rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t border-[#1e3a5f]">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Escribe un mensaje para ${agent.name}...`}
              className="flex-1 bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500"
              disabled={isLoading || !chatId}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || !chatId}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
