"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { getApprovals, updateApprovalStatus } from "@/app/actions/actions"
import { Approval } from "@/lib/types"

export function ApprovalsPanel() {
  const { approvals, setApprovals } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const data = await getApprovals()
        setApprovals(data)
      } catch (error) {
        console.error("Error loading approvals:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadApprovals()
  }, [setApprovals])

  const pendingApprovals = approvals.filter((a) => a.status === "pending")

  const handleApprove = async (id: string) => {
    try {
      await updateApprovalStatus(id, "approved")
      setApprovals(
        approvals.map((a) =>
          a.id === id ? { ...a, status: "approved" as const, resolvedAt: new Date() } : a
        )
      )
    } catch (error) {
      console.error("Error approving:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateApprovalStatus(id, "rejected")
      setApprovals(
        approvals.map((a) =>
          a.id === id ? { ...a, status: "rejected" as const, resolvedAt: new Date() } : a
        )
      )
    } catch (error) {
      console.error("Error rejecting:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Aprobaciones Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400 text-sm">Cargando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0f2744] border-[#1e3a5f]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Aprobaciones Pendientes
          </div>
          {pendingApprovals.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-0">
              {pendingApprovals.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {pendingApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-slate-400 text-sm">No hay aprobaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: Approval
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-3 bg-[#162d4a] rounded-lg border border-[#1e3a5f]">
      <div className="flex items-start justify-between mb-2">
        <p className="text-white text-sm font-medium">{approval.title}</p>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <Clock className="w-3 h-3" />
          {formatTime(approval.createdAt)}
        </div>
      </div>
      {approval.description && (
        <p className="text-slate-400 text-xs mb-3">{approval.description}</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onApprove(approval.id)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
        >
          Aprobar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReject(approval.id)}
          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
        >
          Rechazar
        </Button>
      </div>
    </div>
  )
}
