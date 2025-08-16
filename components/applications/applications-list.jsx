"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { MapPin, Clock, DollarSign, Building2, Calendar, Eye } from "lucide-react"

export default function ApplicationsList() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("status", filter)
      }

      const response = await fetch(`/api/me/applications?${params}`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "reviewing":
        return "bg-yellow-100 text-yellow-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
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
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="reviewing">Under Review</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((application) => {
            const job = application.job
            const tenant = application.tenant
            const salary = formatSalary(job?.salaryRange)

            return (
              <Card key={application._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job?.title}</CardTitle>
                      {tenant && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{tenant.name}</span>
                        </div>
                      )}
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job?.type?.charAt(0).toUpperCase() + job?.type?.slice(1).replace("-", " ")}
                        </span>
                        {salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {salary}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 line-clamp-2">{job?.description}</p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied {formatDate(application.appliedAt)}
                        </span>
                        {application.updatedAt !== application.appliedAt && (
                          <span>Updated {formatDate(application.updatedAt)}</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>

                    {/* Application Timeline */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Status:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Applied</span>
                          {application.status !== "applied" && (
                            <>
                              <div className="w-8 h-px bg-gray-300"></div>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  ["reviewing", "interview", "offer"].includes(application.status)
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span
                                className={
                                  ["reviewing", "interview", "offer"].includes(application.status)
                                    ? "text-yellow-600"
                                    : "text-gray-500"
                                }
                              >
                                {application.status === "reviewing"
                                  ? "Under Review"
                                  : application.status === "interview"
                                    ? "Interview"
                                    : application.status === "offer"
                                      ? "Offer"
                                      : "Next Step"}
                              </span>
                            </>
                          )}
                        </div>
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
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No Applications Yet</h3>
                  <p className="text-gray-600 mt-1">
                    {filter === "all"
                      ? "You haven't applied to any jobs yet. Start browsing opportunities!"
                      : `No applications with status "${filter}"`}
                  </p>
                </div>
                <Button onClick={() => (window.location.href = "/jobs")}>Browse Jobs</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
