import { create } from "zustand"
import type { Chat, Message, Workflow, Approval, MVPContext, Agent } from "./types"
import { AGENTS } from "./agents"

interface AppState {
  // UI State
  activeTab: "agents" | "chat" | "mvp-context" | "workflow"
  setActiveTab: (tab: "agents" | "chat" | "mvp-context" | "workflow") => void
  
  // Agent State
  agents: Agent[]
  selectedAgent: Agent | null
  setSelectedAgent: (agent: Agent | null) => void
  
  // Chat State
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  setChats: (chats: Chat[]) => void
  setActiveChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  
  // Workflow State
  workflows: Workflow[]
  setWorkflows: (workflows: Workflow[]) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  
  // Approval State
  approvals: Approval[]
  setApprovals: (approvals: Approval[]) => void
  updateApproval: (id: string, status: "approved" | "rejected") => void
  
  // MVP Context State
  mvpContext: MVPContext | null
  setMvpContext: (context: MVPContext | null) => void
  
  // User State
  user: { id: string; name: string; email: string } | null
  setUser: (user: { id: string; name: string; email: string } | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // UI State
  activeTab: "agents",
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Agent State
  agents: AGENTS,
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  
  // Chat State
  chats: [],
  activeChat: null,
  messages: [],
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  
  // Workflow State
  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),
  addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
  updateWorkflow: (id, updates) => set((state) => ({
    workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w))
  })),
  
  // Approval State
  approvals: [],
  setApprovals: (approvals) => set({ approvals }),
  updateApproval: (id, status) => set((state) => ({
    approvals: state.approvals.map((a) => 
      a.id === id ? { ...a, status, resolvedAt: new Date() } : a
    )
  })),
  
  // MVP Context State
  mvpContext: null,
  setMvpContext: (context) => set({ mvpContext: context }),
  
  // User State
  user: null,
  setUser: (user) => set({ user }),
}))
