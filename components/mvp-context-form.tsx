"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  Plus, 
  X, 
  Save, 
  BookOpen,
  CheckCircle2,
  Users,
  ListChecks,
  AlertTriangle,
  Target
} from "lucide-react"
import { saveMVPContext, getMVPContext } from "@/app/actions/actions"

export function MVPContextForm() {
  const { mvpContext, setMvpContext } = useAppStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetUsers, setTargetUsers] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [newRestriction, setNewRestriction] = useState("")
  const [successCriteria, setSuccessCriteria] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load existing context
  useEffect(() => {
    const loadContext = async () => {
      const context = await getMVPContext()
      if (context) {
        setName(context.name)
        setDescription(context.description || "")
        setTargetUsers(context.targetUsers || "")
        setFeatures(context.features ? JSON.parse(context.features) : [])
        setRestrictions(context.restrictions ? JSON.parse(context.restrictions) : [])
        setSuccessCriteria(context.successCriteria || "")
        setMvpContext(context)
      }
    }
    loadContext()
  }, [setMvpContext])

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const addRestriction = () => {
    if (newRestriction.trim()) {
      setRestrictions([...restrictions, newRestriction.trim()])
      setNewRestriction("")
    }
  }

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!name.trim()) return
    
    setIsSaving(true)
    try {
      const context = await saveMVPContext({
        name,
        description,
        targetUsers,
        features: JSON.stringify(features),
        restrictions: JSON.stringify(restrictions),
        successCriteria,
      })
      setMvpContext(context)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving MVP context:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-white">Contexto MVP</CardTitle>
              <CardDescription className="text-slate-400">
                Define el contexto del proyecto para que los agentes trabajen de manera coordinada
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label className="text-slate-300">Nombre del Proyecto *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sistema de Gestion de Tareas"
              className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-slate-300">Descripcion del Proyecto *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente que es el proyecto y que problema resuelve..."
              className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500 min-h-[100px]"
            />
          </div>

          {/* Target Users */}
          <div className="space-y-2">
            <Label className="text-slate-300">Usuarios Objetivo</Label>
            <Input
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              placeholder="Ej: Desarrolladores de software, Product Managers"
              className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label className="text-slate-300">Caracteristicas Principales</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Agregar caracteristica..."
                className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500"
              />
              <Button 
                onClick={addFeature} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-emerald-500/20 text-emerald-400 border-0 pl-3 pr-1 py-1"
                >
                  {feature}
                  <button
                    onClick={() => removeFeature(index)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="space-y-2">
            <Label className="text-slate-300">Restricciones Tecnicas</Label>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRestriction())}
                placeholder="Agregar restriccion..."
                className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500"
              />
              <Button 
                onClick={addRestriction} 
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {restrictions.map((restriction, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-400 border-0 pl-3 pr-1 py-1"
                >
                  {restriction}
                  <button
                    onClick={() => removeRestriction(index)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Success Criteria */}
          <div className="space-y-2">
            <Label className="text-slate-300">Criterios de Exito</Label>
            <Textarea
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              placeholder="Define las metricas y criterios de aceptacion del MVP..."
              className="bg-[#162d4a] border-[#1e3a5f] text-white placeholder:text-slate-500 min-h-[80px]"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Guardado!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Contexto MVP"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Guide */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">Guia del Taller</CardTitle>
              <CardDescription className="text-slate-400">
                Pasos para definir el contexto de tu MVP
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <GuideStep 
              number={1} 
              title="Define tu proyecto" 
              description="Nombre y descripcion clara del MVP"
              icon={<Target className="w-4 h-4" />}
            />
            <GuideStep 
              number={2} 
              title="Identifica usuarios" 
              description="Define quienes usaran tu producto"
              icon={<Users className="w-4 h-4" />}
            />
            <GuideStep 
              number={3} 
              title="Lista caracteristicas" 
              description="Funcionalidades principales del MVP"
              icon={<ListChecks className="w-4 h-4" />}
            />
            <GuideStep 
              number={4} 
              title="Establece restricciones" 
              description="Tecnologias y limitaciones tecnicas"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <GuideStep 
              number={5} 
              title="Define exito" 
              description="Metricas y criterios de aceptacion"
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
          </div>

          <div className="mt-6 p-4 bg-[#162d4a] rounded-xl border border-[#1e3a5f]">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Basado en doc/talleres/02-orquestando-agentes-con-crewai</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GuideStep({ 
  number, 
  title, 
  description, 
  icon 
}: { 
  number: number
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{title}</span>
        </div>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}
