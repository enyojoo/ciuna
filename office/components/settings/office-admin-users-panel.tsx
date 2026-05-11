"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2, UserCog } from "lucide-react"
import { officeFetch } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { SUPER_ADMIN_ROLE } from "@/lib/admin-role"

type AdminRow = {
  id: string
  email: string
  name: string | null
  role: string
  status: string | null
  created_at: string | null
}

function AdminUsersTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-32" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="w-[100px]">
              <Skeleton className="h-4 w-8" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export type OfficeAdminUsersPanelProps = {
  /** False until the first settings `loadAllData` run finishes (same as Hub Services tab). */
  settingsBootComplete: boolean
}

export function OfficeAdminUsersPanel({ settingsBootComplete }: OfficeAdminUsersPanelProps) {
  const { user } = useAuth()
  const [rows, setRows] = useState<AdminRow[]>([])
  const [listFetchState, setListFetchState] = useState<"idle" | "loading" | "done">("idle")
  const [actionSaving, setActionSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const load = useCallback(async () => {
    setListFetchState("loading")
    try {
      const res = await officeFetch("/api/admin/admin-users")
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error("admin-users list:", j?.error || res.statusText)
        setRows([])
        return
      }
      setRows((j.adminUsers || []) as AdminRow[])
    } finally {
      setListFetchState("done")
    }
  }, [])

  useEffect(() => {
    if (!settingsBootComplete) return
    void load()
  }, [settingsBootComplete, load])

  const showSkeleton = !settingsBootComplete || listFetchState !== "done"
  const showEmpty = settingsBootComplete && listFetchState === "done" && rows.length === 0
  const showTable = settingsBootComplete && listFetchState === "done" && rows.length > 0

  const handleCreate = async () => {
    setActionSaving(true)
    try {
      const res = await officeFetch("/api/admin/admin-users", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role: "admin" }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(j?.error || "Failed to add admin")
        return
      }
      setOpen(false)
      setEmail("")
      setName("")
      await load()
    } finally {
      setActionSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this admin user? They will no longer be able to sign in to Office.")) return
    setActionSaving(true)
    try {
      const res = await officeFetch(`/api/admin/admin-users/${id}`, { method: "DELETE" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(j?.error || "Failed to deactivate")
        return
      }
      await load()
    } finally {
      setActionSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Office administrators</CardTitle>
        <CardDescription>
          Each invite creates an admin user with a sign-in link. Super admins cannot be created from this dialog.
        </CardDescription>
        <CardAction>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" disabled={!settingsBootComplete}>
                <Plus className="h-4 w-4 mr-2" />
                Add admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Display name</Label>
                  <Input
                    id="admin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={actionSaving || !email.trim()}
                  onClick={() => void handleCreate()}
                >
                  {actionSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send invite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showSkeleton ? <AdminUsersTableSkeleton /> : null}

        {showTable ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.email}</TableCell>
                    <TableCell>{r.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.role === SUPER_ADMIN_ROLE ? "default" : "secondary"}>{r.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {r.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={actionSaving || r.id === user?.id}
                          onClick={() => void handleDelete(r.id)}
                          title={r.id === user?.id ? "Cannot deactivate yourself" : undefined}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="py-8 text-center text-gray-500">
            <UserCog className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>No admin users yet</p>
            <p className="mt-1 text-sm text-gray-400">Invite someone to grant Office access.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
