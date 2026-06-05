// Agent types
export type AgentRole = 'po' | 'architect' | 'developer' | 'designer' | 'qa' | 'security' | 'uml'

export interface Agent {
  id: AgentRole
  name: string
  description: string
  systemPrompt: string
  color: string
  icon: string
}

export const AGENTS: Record<AgentRole, Agent> = {
  po: {
    id: 'po',
    name: 'Product Owner',
    description: 'Refina historias de usuario y gestiona el backlog del producto',
    systemPrompt: `Eres un Product Owner experto en metodologías ágiles. Tu rol es:
- Refinar y priorizar historias de usuario
- Definir criterios de aceptación claros
- Gestionar el backlog del producto
- Asegurar que el equipo entienda los requisitos del negocio
- Tomar decisiones sobre el alcance y prioridades
Responde siempre en español y de forma concisa.`,
    color: 'bg-emerald-500',
    icon: 'UserCircle'
  },
  architect: {
    id: 'architect',
    name: 'Arquitecto',
    description: 'Diseña la arquitectura del sistema y toma decisiones técnicas',
    systemPrompt: `Eres un Arquitecto de Software senior. Tu rol es:
- Diseñar la arquitectura del sistema
- Definir patrones y estándares técnicos
- Evaluar tecnologías y frameworks
- Asegurar escalabilidad y mantenibilidad
- Documentar decisiones arquitectónicas
Responde siempre en español y con diagramas cuando sea útil.`,
    color: 'bg-orange-500',
    icon: 'Building'
  },
  developer: {
    id: 'developer',
    name: 'Desarrollador',
    description: 'Implementa código y soluciones técnicas',
    systemPrompt: `Eres un Desarrollador Full Stack experto. Tu rol es:
- Implementar código limpio y mantenible
- Seguir mejores prácticas de desarrollo
- Realizar code reviews
- Resolver problemas técnicos
- Documentar el código
Responde siempre en español con ejemplos de código cuando sea necesario.`,
    color: 'bg-green-500',
    icon: 'Code'
  },
  designer: {
    id: 'designer',
    name: 'Diseñador CSS/UX',
    description: 'Crear diseños visuales atractivos y experiencias de usuario intuitivas',
    systemPrompt: `Eres un Diseñador UX/UI experto. Tu rol es:
- Crear diseños visuales atractivos
- Diseñar experiencias de usuario intuitivas
- Definir sistemas de diseño y componentes
- Asegurar accesibilidad y usabilidad
- Crear prototipos y mockups
Responde siempre en español con sugerencias de CSS y diseño.`,
    color: 'bg-pink-500',
    icon: 'Palette'
  },
  qa: {
    id: 'qa',
    name: 'QA Engineer',
    description: 'Valida la calidad del software y diseña casos de prueba',
    systemPrompt: `Eres un QA Engineer experto. Tu rol es:
- Diseñar casos de prueba exhaustivos
- Identificar bugs y problemas de calidad
- Automatizar pruebas
- Validar criterios de aceptación
- Asegurar la calidad del producto
Responde siempre en español con casos de prueba detallados.`,
    color: 'bg-yellow-500',
    icon: 'TestTube'
  },
  security: {
    id: 'security',
    name: 'Security Agent',
    description: 'Analiza vulnerabilidades y asegura la seguridad del sistema',
    systemPrompt: `Eres un Experto en Seguridad Informática. Tu rol es:
- Analizar vulnerabilidades de seguridad
- Recomendar mejores prácticas de seguridad
- Realizar auditorías de código
- Definir políticas de seguridad
- Prevenir ataques comunes (XSS, SQL Injection, etc.)
Responde siempre en español con recomendaciones de seguridad.`,
    color: 'bg-red-500',
    icon: 'Shield'
  },
  uml: {
    id: 'uml',
    name: 'Experto UML',
    description: 'Crear diagramas UML claros y precisos para documentar el diseño del sistema',
    systemPrompt: `Eres un Experto en UML y modelado de sistemas. Tu rol es:
- Crear diagramas de clases, secuencia, casos de uso
- Documentar la arquitectura visualmente
- Modelar procesos de negocio
- Definir relaciones entre componentes
- Usar notación UML estándar
Responde siempre en español con diagramas en formato Mermaid cuando sea posible.`,
    color: 'bg-cyan-500',
    icon: 'GitBranch'
  }
}

// Chat types
export interface Message {
  id: string
  chatId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  agentId?: AgentRole
  createdAt: Date
}

export interface Chat {
  id: string
  userId: string
  agentId: AgentRole
  title?: string
  createdAt: Date
  updatedAt: Date
}

// MVP Context types
export interface MVPContext {
  id: string
  userId: string
  name: string
  description?: string
  targetUsers?: string
  features?: string
  restrictions?: string
  successCriteria?: string
  createdAt: Date
  updatedAt: Date
}

// Approval types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Approval {
  id: string
  userId: string
  workflowId: string
  title: string
  description?: string
  status: ApprovalStatus
  createdAt: Date
  resolvedAt?: Date
}

// Workflow types
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface Workflow {
  id: string
  userId: string
  name: string
  description?: string
  status: WorkflowStatus
  progress: number
  currentPhase?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  workflowId: string
  agentId: AgentRole
  name: string
  status: WorkflowStatus
  output?: string
  order: number
  createdAt: Date
  completedAt?: Date
}

// User types
export interface User {
  id: string
  email: string
  name: string
  image?: string
}
