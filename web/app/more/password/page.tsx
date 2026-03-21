"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppPageHeader } from "@/components/layout/app-page-header"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement password change logic
    setTimeout(() => {
      setLoading(false)
      setCurrentPassword("")
      setNewPassword("")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <AppPageHeader title="Change Password" backHref="/more" />

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
          <p className="text-base text-gray-600 -mt-1">Update your account password</p>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Password Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="currentPassword" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-xs font-normal text-gray-500 uppercase tracking-wide">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="font-medium"
                  />
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}


