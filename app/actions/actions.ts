'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, messages, mvpContexts, approvals, workflows, workflowSteps, user } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { AgentRole } from '@/lib/types'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Chat actions
export async function createChat(agentId: AgentRole) {
  const userId = await getUserId()
  const id = crypto.randomUUID()
  
  await db.insert(chats).values({
    id,
    userId,
    agentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  
  revalidatePath('/')
  return id
}

export async function getChats() {
  const userId = await getUserId()
  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
}

export async function getChatsByAgent(agentId: AgentRole) {
  const userId = await getUserId()
  return db
    .select()
    .from(chats)
    .where(and(eq(chats.userId, userId), eq(chats.agentId, agentId)))
    .orderBy(desc(chats.updatedAt))
}

export async function deleteChat(chatId: string) {
  const userId = await getUserId()
  await db.delete(messages).where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
  await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  revalidatePath('/')
}

// Message actions
export async function getMessages(chatId: string) {
  const userId = await getUserId()
  return db
    .select()
    .from(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
    .orderBy(messages.createdAt)
}

export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string, agentId?: AgentRole) {
  const userId = await getUserId()
  const id = crypto.randomUUID()
  
  await db.insert(messages).values({
    id,
    chatId,
    userId,
    role,
    content,
    agentId,
    createdAt: new Date(),
  })
  
  // Update chat title if it's the first user message
  const chatMessages = await db
    .select()
    .from(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
  
  if (chatMessages.length === 1 && role === 'user') {
    await db
      .update(chats)
      .set({ title: content.slice(0, 50), updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  } else {
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  }
  
  revalidatePath('/')
  return id
}

// MVP Context actions
export async function getMVPContext() {
  const userId = await getUserId()
  const contexts = await db
    .select()
    .from(mvpContexts)
    .where(eq(mvpContexts.userId, userId))
    .orderBy(desc(mvpContexts.updatedAt))
    .limit(1)
  
  return contexts[0] || null
}

export async function saveMVPContext(data: {
  name: string
  description?: string
  targetUsers?: string
  features?: string
  restrictions?: string
  successCriteria?: string
}) {
  const userId = await getUserId()
  
  // Check if context exists
  const existing = await db
    .select()
    .from(mvpContexts)
    .where(eq(mvpContexts.userId, userId))
    .limit(1)
  
  if (existing.length > 0) {
    await db
      .update(mvpContexts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mvpContexts.id, existing[0].id))
    return existing[0].id
  }
  
  const id = crypto.randomUUID()
  await db.insert(mvpContexts).values({
    id,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  
  revalidatePath('/')
  return id
}

// Approval actions
export async function getApprovals() {
  const userId = await getUserId()
  return db
    .select()
    .from(approvals)
    .where(eq(approvals.userId, userId))
    .orderBy(desc(approvals.createdAt))
}

export async function updateUserProfile(name: string) {
  const userId = await getUserId()

  await db
    .update(user)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))

  revalidatePath('/')
}

export async function getPendingApprovals() {
  const userId = await getUserId()
  return db
    .select()
    .from(approvals)
    .where(and(eq(approvals.userId, userId), eq(approvals.status, 'pending')))
    .orderBy(desc(approvals.createdAt))
}

export async function createApproval(workflowId: string, title: string, description?: string) {
  const userId = await getUserId()
  const id = crypto.randomUUID()
  
  await db.insert(approvals).values({
    id,
    userId,
    workflowId,
    title,
    description,
    status: 'pending',
    createdAt: new Date(),
  })
  
  revalidatePath('/')
  return id
}

export async function resolveApproval(approvalId: string, status: 'approved' | 'rejected') {
  const userId = await getUserId()
  
  await db
    .update(approvals)
    .set({
      status,
      resolvedAt: new Date(),
    })
    .where(and(eq(approvals.id, approvalId), eq(approvals.userId, userId)))
  
  revalidatePath('/')
}

// Workflow actions
export async function getWorkflows() {
  const userId = await getUserId()
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.userId, userId))
    .orderBy(desc(workflows.createdAt))
}

export async function createWorkflow(name: string, description?: string) {
  const userId = await getUserId()
  const id = `WF-SDAI-${Math.floor(Math.random() * 1000)}`
  
  await db.insert(workflows).values({
    id,
    userId,
    name,
    description,
    status: 'pending',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  
  revalidatePath('/')
  return id
}

export async function updateWorkflow(workflowId: string, data: {
  status?: string
  progress?: number
  currentPhase?: string
}) {
  const userId = await getUserId()
  
  await db
    .update(workflows)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
  
  revalidatePath('/')
}

export async function getWorkflowSteps(workflowId: string) {
  const userId = await getUserId()
  
  // Verify workflow belongs to user
  const workflow = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
    .limit(1)
  
  if (!workflow.length) throw new Error('Workflow not found')
  
  return db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, workflowId))
    .orderBy(workflowSteps.order)
}

export async function createWorkflowStep(workflowId: string, agentId: AgentRole, name: string, order: number) {
  const userId = await getUserId()
  
  // Verify workflow belongs to user
  const workflow = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
    .limit(1)
  
  if (!workflow.length) throw new Error('Workflow not found')
  
  const id = crypto.randomUUID()
  
  await db.insert(workflowSteps).values({
    id,
    workflowId,
    agentId,
    name,
    status: 'pending',
    order,
    createdAt: new Date(),
  })
  
  revalidatePath('/')
  return id
}

export async function updateWorkflowStep(stepId: string, data: {
  status?: string
  output?: string
}) {
  await db
    .update(workflowSteps)
    .set({
      ...data,
      ...(data.status === 'completed' ? { completedAt: new Date() } : {}),
    })
    .where(eq(workflowSteps.id, stepId))
  
  revalidatePath('/')
}
