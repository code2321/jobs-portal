"use client"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { MapPin, Clock, DollarSign, Building2, User, GraduationCap, Briefcase, Code, FolderOpen } from "lucide-react"

export default function ApplyModal({ job, isOpen, onClose, onSuccess }) {
  const [profile, setProfile] = useState(null)
  const [selectedSections, setSelectedSections] = useState({
    personal: true,
    education: false,
    experience: false,
    projects: false,
    skills: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      setError("Failed to load profile")
    }
  }

  const handleSectionToggle = (section, checked) => {
    setSelectedSections((prev) => ({ ...prev, [section]: checked }))
  }

  const buildShareSet = () => {
    const shareSet = {}

    if (selectedSections.personal && profile?.sections?.personal) {
      shareSet.personal = profile.sections.personal
    }

    if (selectedSections.education && profile?.sections?.education?.length > 0) {
      shareSet.education = profile.sections.education
    }

    if (selectedSections.experience && profile?.sections?.experience?.length > 0) {
      shareSet.experience = profile.sections.experience
    }

    if (selectedSections.projects && profile?.sections?.projects?.length > 0) {
      shareSet.projects = profile.sections.projects
    }

    if (selectedSections.skills && profile?.sections?.skills?.length > 0) {
      shareSet.skills = profile.sections.skills
    }

    return shareSet
  }

  const handleApply = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("accessToken")
      const shareSet = buildShareSet()

      const response = await fetch(`/api/jobs/${job._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareSet }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      onSuccess?.(data.application)
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
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

  const getSectionIcon = (section) => {
    switch (section) {
      case "personal":
        return <User className="h-4 w-4" />
      case "education":
        return <GraduationCap className="h-4 w-4" />
      case "experience":
        return <Briefcase className="h-4 w-4" />
      case "projects":
        return <FolderOpen className="h-4 w-4" />
      case "skills":
        return <Code className="h-4 w-4" />
      default:
        return null
    }
  }

  const getSectionCount = (section) => {
    if (!profile?.sections) return 0
    if (section === "personal") {
      return Object.keys(profile.sections.personal || {}).length > 0 ? 1 : 0
    }
    return profile.sections[section]?.length || 0
  }

  const salary = formatSalary(job?.salaryRange)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {job?.title}</DialogTitle>
          <DialogDescription>Choose which parts of your profile to share with this employer</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Job Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{job?.title}</CardTitle>
                  {job?.tenant && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{job.tenant.name}</span>
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
              </div>
            </CardHeader>
          </Card>

          {/* Profile Sections Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Profile Information to Share</CardTitle>
              <CardDescription>Choose which sections of your profile the employer will see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(selectedSections).map(([section, isSelected]) => {
                const count = getSectionCount(section)
                const hasData = count > 0

                return (
                  <div key={section} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={section}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSectionToggle(section, checked)}
                        disabled={!hasData}
                      />
                      <div className="flex items-center gap-2">
                        {getSectionIcon(section)}
                        <div>
                          <label htmlFor={section} className="text-sm font-medium capitalize cursor-pointer">
                            {section === "personal" ? "Personal Information" : section}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {hasData ? `${count} item${count !== 1 ? "s" : ""}` : "No data available"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isSelected && hasData && <Badge variant="secondary">Included</Badge>}
                  </div>
                )
              })}

              {!profile && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              )}

              {profile && Object.values(selectedSections).every((selected) => !selected) && (
                <Alert>
                  <AlertDescription>Please select at least one section to share with the employer.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Application Preview */}
          {Object.values(selectedSections).some((selected) => selected) && (
            <Card>
              <CardHeader>
                <CardTitle>Application Preview</CardTitle>
                <CardDescription>This is what the employer will see</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSections.personal && profile?.sections?.personal && (
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {profile.sections.personal.firstName && (
                        <p>
                          Name: {profile.sections.personal.firstName} {profile.sections.personal.lastName}
                        </p>
                      )}
                      {profile.sections.personal.email && <p>Email: {profile.sections.personal.email}</p>}
                      {profile.sections.personal.phone && <p>Phone: {profile.sections.personal.phone}</p>}
                      {profile.sections.personal.location && <p>Location: {profile.sections.personal.location}</p>}
                    </div>
                  </div>
                )}

                {selectedSections.skills && profile?.sections?.skills?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Skills ({profile.sections.skills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.sections.skills.slice(0, 10).map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill.name}
                        </Badge>
                      ))}
                      {profile.sections.skills.length > 10 && (
                        <Badge variant="outline">+{profile.sections.skills.length - 10} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                {selectedSections.experience && profile?.sections?.experience?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Experience ({profile.sections.experience.length} positions)</h4>
                    <div className="text-sm text-muted-foreground">
                      {profile.sections.experience.slice(0, 3).map((exp, index) => (
                        <p key={index}>
                          {exp.position} at {exp.company}
                        </p>
                      ))}
                      {profile.sections.experience.length > 3 && <p>+{profile.sections.experience.length - 3} more</p>}
                    </div>
                  </div>
                )}

                {selectedSections.education && profile?.sections?.education?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Education ({profile.sections.education.length} entries)</h4>
                    <div className="text-sm text-muted-foreground">
                      {profile.sections.education.slice(0, 2).map((edu, index) => (
                        <p key={index}>
                          {edu.degree} in {edu.field} from {edu.institution}
                        </p>
                      ))}
                      {profile.sections.education.length > 2 && <p>+{profile.sections.education.length - 2} more</p>}
                    </div>
                  </div>
                )}

                {selectedSections.projects && profile?.sections?.projects?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Projects ({profile.sections.projects.length} projects)</h4>
                    <div className="text-sm text-muted-foreground">
                      {profile.sections.projects.slice(0, 3).map((project, index) => (
                        <p key={index}>{project.name}</p>
                      ))}
                      {profile.sections.projects.length > 3 && <p>+{profile.sections.projects.length - 3} more</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={loading || !Object.values(selectedSections).some((selected) => selected)}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
