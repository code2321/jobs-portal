"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { MoreHorizontal, Mail, Calendar, User, Eye } from "lucide-react"
import { useAuth } from "../../lib/auth-context.js"

const PIPELINE_STAGES = [
  { key: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { key: "reviewing", label: "Reviewing", color: "bg-yellow-100 text-yellow-800" },
  { key: "interview", label: "Interview", color: "bg-purple-100 text-purple-800" },
  { key: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
]

export default function ApplicationPipeline({ jobId = null }) {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(jobId || "all")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.tenantId) {
      fetchJobs()
      fetchApplications()
    }
  }, [user, selectedJob])

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/tenants/${user.tenantId}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams()
      if (selectedJob !== "all") {
        params.append("jobId", selectedJob)
      }

      const response = await fetch(`/api/tenants/${user.tenantId}/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchApplications() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update application status:", error)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const groupApplicationsByStatus = () => {
    const grouped = {}
    PIPELINE_STAGES.forEach((stage) => {
      grouped[stage.key] = applications.filter((app) => app.status === stage.key)
    })
    return grouped
  }

  const groupedApplications = groupApplicationsByStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Pipeline</h2>
          <p className="text-gray-600">Manage candidates through your hiring process</p>
        </div>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job._id} value={job._id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {PIPELINE_STAGES.map((stage) => {
          const stageApplications = groupedApplications[stage.key] || []

          return (
            <div key={stage.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{stage.label}</h3>
                <Badge variant="secondary">{stageApplications.length}</Badge>
              </div>

              <div className="space-y-3">
                {stageApplications.map((application) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(application.candidate?.firstName, application.candidate?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm">
                              {application.candidate?.firstName} {application.candidate?.lastName}
                            </CardTitle>
                            <CardDescription className="text-xs">{application.job?.title}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </DropdownMenuItem>
                            {PIPELINE_STAGES.filter((s) => s.key !== application.status).map((nextStage) => (
                              <DropdownMenuItem
                                key={nextStage.key}
                                onClick={() => updateApplicationStatus(application._id, nextStage.key)}
                              >
                                Move to {nextStage.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{application.candidate?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Applied {formatDate(application.appliedAt)}</span>
                        </div>
                        {application.shareSet?.skills && application.shareSet.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {application.shareSet.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {skill.name}
                              </Badge>
                            ))}
                            {application.shareSet.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{application.shareSet.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {stageApplications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No candidates</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Applications Yet</h3>
                <p className="text-gray-600 mt-1">
                  {selectedJob === "all"
                    ? "You haven't received any applications yet"
                    : "This job hasn't received any applications yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
