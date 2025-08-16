"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Users, Calendar, MapPin, DollarSign } from "lucide-react"
import { useAuth } from "../../lib/auth-context.js"

export default function JobManagement() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    if (user?.tenantId) {
      fetchJobs()
    }
  }, [user, filter])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("status", filter)
      }

      const response = await fetch(`/api/tenants/${user.tenantId}/jobs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatSalary = (salaryRange) => {
    if (!salaryRange?.min && !salaryRange?.max) return null
    const { min, max, currency } = salaryRange
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    if (min) {
      return `From ${formatter.format(min)}`
    }
    if (max) {
      return `Up to ${formatter.format(max)}`
    }
    return null
  }

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update job status:", error)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
          <p className="text-gray-600">Create and manage your job postings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => (window.location.href = "/recruiter/jobs/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const salary = formatSalary(job.salaryRange)

            return (
              <Card key={job._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace("-", " ")}
                        </span>
                        {salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {salary}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => (window.location.href = `/recruiter/jobs/${job._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => (window.location.href = `/recruiter/jobs/${job._id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(job._id, job.status === "active" ? "paused" : "active")}
                        >
                          {job.status === "active" ? "Pause Job" : "Activate Job"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteJob(job._id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 line-clamp-2">{job.description}</p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 6 && <Badge variant="outline">+{job.skills.length - 6} more</Badge>}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Created {formatDate(job.createdAt)}</span>
                        {job.updatedAt !== job.createdAt && <span>Updated {formatDate(job.updatedAt)}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/recruiter/jobs/${job._id}/applications`)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-4 w-4" />
                          {job.applicationsCount || 0} Applications
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No Jobs Posted Yet</h3>
                  <p className="text-gray-600 mt-1">
                    {filter === "all"
                      ? "Create your first job posting to start attracting candidates"
                      : `No jobs with status "${filter}"`}
                  </p>
                </div>
                <Button onClick={() => (window.location.href = "/recruiter/jobs/new")}>Create First Job</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
