import { streamText } from 'ai'
import { AGENTS } from '@/lib/types'
import type { AgentRole } from '@/lib/types'

export async function POST(req: Request) {
  const { messages, agentId, mvpContext } = await req.json()
  
  const agent = AGENTS[agentId as AgentRole]
  
  if (!agent) {
    return new Response('Invalid agent', { status: 400 })
  }
  
  let systemPrompt = agent.systemPrompt
  
  // Add MVP context if available
  if (mvpContext) {
    systemPrompt += `\n\nContexto del MVP del proyecto:
- Nombre: ${mvpContext.name}
- Descripción: ${mvpContext.description || 'No especificada'}
- Usuarios objetivo: ${mvpContext.targetUsers || 'No especificados'}
- Características principales: ${mvpContext.features || 'No especificadas'}
- Restricciones técnicas: ${mvpContext.restrictions || 'No especificadas'}
- Criterios de éxito: ${mvpContext.successCriteria || 'No especificados'}

Usa este contexto para dar respuestas más relevantes y específicas al proyecto.`
  }
  
  const result = streamText({
    model: 'anthropic/claude-sonnet-4-20250514',
    system: systemPrompt,
    messages,
  })
  
  return result.toDataStreamResponse()
}
