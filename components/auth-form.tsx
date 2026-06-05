"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Loader2 } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (result.error) {
          setError(result.error.message || "Error al registrarse")
          setLoading(false)
          return
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        })
        if (result.error) {
          setError(result.error.message || "Error al iniciar sesion")
          setLoading(false)
          return
        }
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("Ocurrio un error inesperado")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_22%)] pointer-events-none" />
      <Card className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/95 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-emerald-500/20 via-cyan-400/15 to-sky-500/10" />
        <CardHeader className="relative text-center space-y-3 px-10 pt-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/90 ring-1 ring-emerald-300/25">
            <Bot className="h-8 w-8 text-emerald-300" />
          </div>
          <CardTitle className="text-3xl font-semibold text-white">
            {mode === "sign-in" ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="mx-auto max-w-md text-sm text-slate-300">
            {mode === "sign-in"
              ? "Entra a ScrumDev AI para gestionar tus agentes y flujos de trabajo."
              : "Regístrate y comienza a usar tus agentes inteligentes con un solo click."}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative px-10 pb-12 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Nombre
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                  {mode === "sign-in" ? "Ingresando..." : "Registrando..."}
                </>
              ) : mode === "sign-in" ? (
                "Iniciar Sesión"
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-300">
            {mode === "sign-in" ? (
              <>
                ¿No tienes cuenta?{' '}
                <Link href="/sign-up" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Regístrate
                </Link>
              </>
            ) : (
              <>
                ¿Ya eres usuario?{' '}
                <Link href="/sign-in" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Inicia sesión
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
