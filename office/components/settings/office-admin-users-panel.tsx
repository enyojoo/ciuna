"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2 } from "lucide-react"
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

export function OfficeAdminUsersPanel() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("admin")

  const load = useCallback(async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await officeFetch("/api/admin/admin-users", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(j?.error || "Failed to add admin")
        return
      }
      setOpen(false)
      setEmail("")
      setName("")
      setRole("admin")
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this admin user? They will no longer be able to sign in to Office.")) return
    setSaving(true)
    try {
      const res = await officeFetch(`/api/admin/admin-users/${id}`, { method: "DELETE" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(j?.error || "Failed to deactivate")
        return
      }
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Office admins</h2>
          <p className="text-gray-600">Invite admins by email and assign the admin role.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
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
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                disabled={saving || !email.trim()}
                onClick={() => void handleCreate()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
          ) : (
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                      No admin users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
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
                            disabled={saving || r.id === user?.id}
                            onClick={() => void handleDelete(r.id)}
                            title={r.id === user?.id ? "Cannot deactivate yourself" : undefined}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
