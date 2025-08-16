"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { MapPin, Clock, DollarSign, Building2, Wifi } from "lucide-react"
import ApplyModal from "../applications/apply-modal.jsx"

export default function JobCard({ job, onApply, showCompany = true }) {
  const [showApplyModal, setShowApplyModal] = useState(false)

  const formatSalary = (salaryRange) => {
    if (!salaryRange.min && !salaryRange.max) return null
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleApplyClick = () => {
    if (onApply) {
      onApply(job)
    } else {
      setShowApplyModal(true)
    }
  }

  const handleApplicationSuccess = (application) => {
    setShowApplyModal(false)
    // Show success message or redirect
    alert("Application submitted successfully!")
  }

  const salary = formatSalary(job.salaryRange)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              {showCompany && job.tenant && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{job.tenant.name}</span>
                </div>
              )}
              <CardDescription className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                  {job.remote && <Wifi className="h-4 w-4 ml-1" title="Remote available" />}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
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
            <Button onClick={handleApplyClick} className="shrink-0">
              Apply Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 line-clamp-3">{job.description}</p>

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
              <span>Posted {formatDate(job.createdAt)}</span>
              {job.applicationsCount > 0 && <span>{job.applicationsCount} applications</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <ApplyModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplicationSuccess}
      />
    </>
  )
}
