import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// App tables
export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  agentId: text('agentId').notNull(),
  title: text('title'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chatId').notNull(),
  userId: text('userId').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  agentId: text('agentId'),
  createdAt: timestamp('createdAt').defaultNow(),
})

export const mvpContexts = pgTable('mvp_contexts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  targetUsers: text('targetUsers'),
  features: text('features'),
  restrictions: text('restrictions'),
  successCriteria: text('successCriteria'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const approvals = pgTable('approvals', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  workflowId: text('workflowId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').defaultNow(),
  resolvedAt: timestamp('resolvedAt'),
})

export const workflows = pgTable('workflows', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  progress: integer('progress').default(0),
  currentPhase: text('currentPhase'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const workflowSteps = pgTable('workflow_steps', {
  id: text('id').primaryKey(),
  workflowId: text('workflowId').notNull(),
  agentId: text('agentId').notNull(),
  name: text('name').notNull(),
  status: text('status').default('pending'),
  output: text('output'),
  order: integer('order').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  completedAt: timestamp('completedAt'),
})
