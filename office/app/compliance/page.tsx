"use client"

import { useState, useEffect, useRef } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, Eye, CheckCircle, Clock, XCircle, User, Mail, Phone, Trash2, Check, ExternalLink, RotateCcw } from "lucide-react"
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { getIdTypeLabel } from "@/lib/country-id-types"
import { countryService, getCountryFlag } from "@/lib/country-service"
import { supabase } from "@/lib/supabase"
import { officeFetch } from "@/lib/api-client"
import { OfficeComplianceSkeleton } from "@/components/office-compliance-skeleton"

interface ComplianceUser {
  id: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  phone?: string
  date_of_birth?: string
  address?: string
  country_code?: string
  bridge_kyc_metadata?: any
  bridge_customer_id?: string
  bridge_signed_agreement_id?: string
  bridge_kyc_status?: string
  bridge_kyc_rejection_reasons?: any
  bridge_endorsements?: any
}

export default function OfficeCompliancePage() {
  // Initialize from cache synchronously to prevent flicker
  // Use cached data even if expired to prevent skeleton flash
  const getInitialUsers = (): ComplianceUser[] => {
    if (typeof window === "undefined") return []
    try {
      const cached = localStorage.getItem("ciuna_compliance_users")
      if (!cached) return []
      const { value, timestamp } = JSON.parse(cached)
      // Return cached data even if expired - we'll refresh in background
      return value || []
    } catch {
      return []
    }
  }

  const getCacheTimestamp = (): number | null => {
    if (typeof window === "undefined") return null
    try {
      const cached = localStorage.getItem("ciuna_compliance_users")
      if (!cached) return null
      const { timestamp } = JSON.parse(cached)
      return timestamp
    } catch {
      return null
    }
  }

  const initialUsers = getInitialUsers()
  const cacheTimestamp = getCacheTimestamp()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  const isCacheFresh = cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)

  const [users, setUsers] = useState<ComplianceUser[]>(initialUsers)
  const [loading, setLoading] = useState(!initialUsers.length) // Only show loading if no cached data
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<ComplianceUser | null>(null)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [initialized, setInitialized] = useState(false)
  const channelRef = useRef<any>(null)
  const [noticeDialog, setNoticeDialog] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' }>({ open: false, title: '', message: '', type: 'success' })
  const [deleting, setDeleting] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    loadCountries()
  }, [])

  const loadData = async (showLoading: boolean = true): Promise<ComplianceUser[]> => {
    try {
      // Only show loading if explicitly requested and we don't have cached data
      if (showLoading && users.length === 0) {
        setLoading(true)
      }
      
      // Get all users with KYC data from users table
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, first_name, middle_name, last_name, phone, date_of_birth, address, country_code, bridge_kyc_metadata, bridge_customer_id, bridge_signed_agreement_id, bridge_kyc_status, bridge_kyc_rejection_reasons, bridge_endorsements")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Map users to ComplianceUser format (all data now comes from users table)
      const usersWithKyc: ComplianceUser[] = (usersData || []).map((user: any) => {
        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name || "",
          middle_name: user.middle_name,
          last_name: user.last_name || "",
          phone: user.phone,
          date_of_birth: user.date_of_birth,
          address: user.address,
          country_code: user.country_code,
          bridge_kyc_metadata: user.bridge_kyc_metadata,
          bridge_customer_id: user.bridge_customer_id,
          bridge_signed_agreement_id: user.bridge_signed_agreement_id,
          bridge_kyc_status: user.bridge_kyc_status,
          bridge_kyc_rejection_reasons: user.bridge_kyc_rejection_reasons,
          bridge_endorsements: user.bridge_endorsements,
        }
      })

      setUsers(usersWithKyc)
      
      // Cache the data
      try {
        localStorage.setItem("ciuna_compliance_users", JSON.stringify({
          value: usersWithKyc,
          timestamp: Date.now()
        }))
      } catch {}
      
      return usersWithKyc
    } catch (error) {
      console.error("Error loading compliance data:", error)
      // On error, keep existing data if available
      return users.length > 0 ? users : []
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (initialized) return // Don't re-initialize if already done

    // If we have cached data (even if expired), show it immediately and refresh in background
    // Only show loading if we truly have no data
    if (initialUsers.length > 0) {
      // We have cached data, refresh in background if expired
      if (!isCacheFresh) {
        // Cache expired, refresh in background without showing loading
        loadData(false).then(() => {
          setInitialized(true)
        })
      } else {
        // Cache is fresh, we're done
        setInitialized(true)
      }
    } else {
      // No cached data, fetch and show loading
      loadData(true).then(() => {
        setInitialized(true)
      })
    }
  }, [initialized, initialUsers.length, isCacheFresh])

  // Real-time subscription for KYC submission and user updates
  useEffect(() => {
    if (!initialized) return

    // Set up Supabase Realtime subscription for instant updates
    const channel = supabase
      .channel('admin-compliance-updates')
      // Removed kyc_submissions subscription - KYC data is now in users table
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        async (payload) => {
          // Only process if provider-backed KYC fields changed
          const oldData = payload.old as any
          const newData = payload.new as any
          
          const bridgeStatusChanged = 
            oldData?.bridge_kyc_status !== newData?.bridge_kyc_status ||
            oldData?.bridge_customer_id !== newData?.bridge_customer_id ||
            JSON.stringify(oldData?.bridge_kyc_rejection_reasons) !== JSON.stringify(newData?.bridge_kyc_rejection_reasons) ||
            oldData?.full_name !== newData?.full_name ||
            oldData?.date_of_birth !== newData?.date_of_birth ||
            oldData?.address !== newData?.address ||
            JSON.stringify(oldData?.bridge_kyc_metadata) !== JSON.stringify(newData?.bridge_kyc_metadata)
          
          if (bridgeStatusChanged) {
            console.log('Admin compliance: User KYC status update received via Realtime')
            try {
              // Reload data to get updated KYC status (silent refresh, no loading state)
              const updatedUsers = await loadData(false)
              
              // Update selected user if dialog is open and this update affects them
              if (selectedUser && newData && newData.id === selectedUser.id) {
                const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
                if (updatedUser) {
                  setSelectedUser(updatedUser)
                }
              }
            } catch (error) {
              console.error("Error handling real-time KYC status update:", error)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin compliance: Subscribed to user updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Admin compliance: Realtime subscription error')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [initialized, selectedUser?.id])

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll()
      setCountries(data)
    } catch (error) {
      console.error("Error loading countries:", error)
    }
  }

  // Removed handleDeleteSubmission - manual KYC approval no longer needed
  const _handleDeleteSubmission = async (submissionId: string, type: "identity" | "address") => {
    if (!confirm(`Are you sure you want to delete this ${type} submission? The user will need to submit again.`)) {
      return
    }

    try {
      setDeleting(submissionId)
      await kycService.deleteSubmission(submissionId)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user if it's the same user
      if (selectedUser) {
        const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        } else {
          // If user was removed, close dialog
          setUserDetailsDialogOpen(false)
          setSelectedUser(null)
        }
      }
    } catch (error: any) {
      console.error("Error deleting submission:", error)
      setNoticeDialog({
        open: true,
        title: "Failed to Delete Submission",
        message: error.message || "An unknown error occurred",
        type: 'error'
      })
    } finally {
      setDeleting(null)
    }
  }

  // Removed handleApproveSubmission - manual KYC approval no longer needed
  const _handleApproveSubmission = async (submissionId: string, type: "identity" | "address") => {
    if (!selectedUser) return

    try {
      setApproving(submissionId)
      await kycService.updateStatus(submissionId, "approved", selectedUser.id)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user
      const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
    } catch (error: any) {
      console.error("Error approving submission:", error)
      setNoticeDialog({
        open: true,
        title: "Failed to Approve Submission",
        message: error.message || "An unknown error occurred",
        type: 'error'
      })
    } finally {
      setApproving(null)
    }
  }

  // Removed handleSetInReview - manual KYC approval no longer needed
  const _handleSetInReview = async (submissionId: string, type: "identity" | "address") => {
    if (!selectedUser) return

    try {
      setApproving(submissionId)
      await kycService.updateStatus(submissionId, "in_review", selectedUser.id)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user
      const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
    } catch (error: any) {
      console.error("Error setting submission to in review:", error)
      setNoticeDialog({
        open: true,
        title: "Failed to Update Submission",
        message: error.message || "An unknown error occurred",
        type: 'error'
      })
    } finally {
      setApproving(null)
    }
  }

  const handleViewFile = async (filePathOrUrl: string) => {
    if (!filePathOrUrl) return
    
    // Check if it's a file path (starts with "identity/" or "address/") or an old public URL
    const isPath = filePathOrUrl.startsWith("identity/") || filePathOrUrl.startsWith("address/")
    
    if (isPath) {
      // New format: file path - get signed URL from API
      try {
        const response = await officeFetch(`/api/admin/kyc/documents?path=${encodeURIComponent(filePathOrUrl)}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.url) {
            window.open(data.url, "_blank")
          } else {
            console.error("No URL in response:", data)
            alert("Failed to access document: No URL returned from server.")
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.error("Failed to fetch signed URL:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          alert(`Failed to access document: ${errorData.error || response.statusText || "Please try again."}`)
        }
      } catch (error: any) {
        console.error("Error fetching signed URL:", error)
        alert(`Failed to access document: ${error.message || "Please try again."}`)
      }
    } else {
      // Old format: public URL (for backward compatibility with existing records)
      window.open(filePathOrUrl, "_blank")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Done</Badge>
      case "in_review":
        return <Badge className="bg-yellow-100 text-yellow-700">In review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
    }
  }

  // Removed getVerificationStatus - now using bridge_kyc_status directly

  const getBridgeStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under_review":
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "incomplete":
      case "not_started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStoredKycStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusLabels: Record<string, string> = {
      "not_started": "Not Started",
      "incomplete": "Incomplete",
      "under_review": "Under Review",
      "approved": "Approved",
      "rejected": "Rejected"
    }
    
    const label = statusLabels[status] || status
    
    return (
      <Badge className={getBridgeStatusColor(status)}>
        {label}
      </Badge>
    )
  }

  const handleUserSelect = (user: ComplianceUser) => {
    setSelectedUser(user)
    setUserDetailsDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === "all") return matchesSearch
    
    // Filter by bridge_kyc_status
    const bridgeKycStatus = user.bridge_kyc_status || "not_started"
    if (statusFilter === "verified") {
      return matchesSearch && bridgeKycStatus === "approved"
    }
    if (statusFilter === "pending") {
      return matchesSearch && (bridgeKycStatus === "not_started" || bridgeKycStatus === "incomplete")
    }
    if (statusFilter === "in_review") {
      return matchesSearch && (bridgeKycStatus === "under_review" || bridgeKycStatus === "in_review")
    }
    if (statusFilter === "rejected") {
      return matchesSearch && bridgeKycStatus === "rejected"
    }
    
    return matchesSearch
  })

  const getCountryName = (code?: string) => {
    if (!code) return "-"
    const country = countries.find(c => c.code === code)
    return country ? `${country.flag_emoji} ${country.name}` : code
  }

  // Only show skeleton if we're truly loading and have no cached data
  if (loading && !users.length) {
    return (
      <OfficeDashboardLayout>
        <OfficeComplianceSkeleton />
      </OfficeDashboardLayout>
    )
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Approved</SelectItem>
                  <SelectItem value="in_review">Under Review</SelectItem>
                  <SelectItem value="pending">Pending/Not Started</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Verification status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>
                        {user.bridge_kyc_status ? getStoredKycStatusBadge(user.bridge_kyc_status) : <Badge className="bg-gray-100 text-gray-700">Not Started</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" key={selectedUser?.id}>
            <DialogHeader>
              <div className="flex items-center justify-between">
              <DialogTitle>
                Compliance Details - {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogTitle>
                {/* Removed legacy provider handoff button; users complete KYC directly in the current flow */}
              </div>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="h-4 w-4" />
                      <span>Name</span>
                    </div>
                    <p className="text-base font-medium">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="text-base">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                      <p className="text-base">{selectedUser.phone}</p>
                    </div>
                  )}
                </div>

                {/* Identity Verification */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
                  {selectedUser.first_name || selectedUser.date_of_birth ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5">
                            <Badge className="bg-green-100 text-green-700">APPROVED</Badge>
                            <span className="text-sm font-medium text-gray-700">Identity Verified</span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            {selectedUser.first_name && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">First Name:</span>
                                <span className="text-gray-900 font-medium text-xs">{selectedUser.first_name}</span>
                              </div>
                            )}
                            {selectedUser.middle_name && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">Middle Name:</span>
                                <span className="text-gray-900 font-medium text-xs">{selectedUser.middle_name}</span>
                              </div>
                            )}
                            {selectedUser.last_name && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">Last Name:</span>
                                <span className="text-gray-900 font-medium text-xs">{selectedUser.last_name}</span>
                              </div>
                            )}
                            {selectedUser.date_of_birth && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">DOB:</span>
                                <span className="text-gray-900 text-xs">{new Date(selectedUser.date_of_birth).toLocaleDateString()}</span>
                              </div>
                            )}
                            {selectedUser.country_code && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Country:</span>
                                <span className="text-gray-900 font-medium text-xs">{getCountryName(selectedUser.country_code)}</span>
                            </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs">No identity verification data available</p>
                    </div>
                  )}
                </div>

                {/* Address Verification */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Address Verification</h3>
                  {selectedUser.address ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5">
                            <Badge className="bg-green-100 text-green-700">APPROVED</Badge>
                            <span className="text-sm font-medium text-gray-700">Address Verified</span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            {selectedUser.country_code && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Country:</span>
                                <span className="text-gray-900 font-medium text-xs">{getCountryName(selectedUser.country_code)}</span>
                            </div>
                            )}
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs pt-0.5">Address:</span>
                              <span className="text-gray-900 text-xs flex-1">{selectedUser.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs">No address verification data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Notice Dialog */}
        <AlertDialog open={noticeDialog.open} onOpenChange={(open) => setNoticeDialog({ ...noticeDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className={noticeDialog.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {noticeDialog.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {noticeDialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setNoticeDialog({ ...noticeDialog, open: false })}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </OfficeDashboardLayout>
  )
}

