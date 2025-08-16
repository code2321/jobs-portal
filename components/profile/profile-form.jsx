"use client"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Plus, Trash2, Eye, EyeOff, Users } from "lucide-react"

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    sections: {
      personal: {},
      education: [],
      experience: [],
      projects: [],
      skills: [],
    },
    visibility: "PRIVATE",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage("")

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Profile saved successfully!")
        setProfile(data.profile)
      } else {
        setMessage(data.error || "Failed to save profile")
      }
    } catch (error) {
      setMessage("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (section, data) => {
    setProfile((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: data,
      },
    }))
  }

  const addArrayItem = (section, item) => {
    setProfile((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: [...prev.sections[section], item],
      },
    }))
  }

  const updateArrayItem = (section, index, item) => {
    setProfile((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section].map((existing, i) => (i === index ? item : existing)),
      },
    }))
  }

  const removeArrayItem = (section, index) => {
    setProfile((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section].filter((_, i) => i !== index),
      },
    }))
  }

  const getVisibilityIcon = () => {
    switch (profile.visibility) {
      case "PRIVATE":
        return <EyeOff className="h-4 w-4" />
      case "SHARABLE":
        return <Users className="h-4 w-4" />
      case "PUBLIC":
        return <Eye className="h-4 w-4" />
      default:
        return <EyeOff className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with visibility controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Build your professional profile to attract employers</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={profile.visibility}
                onValueChange={(value) => setProfile((prev) => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="w-40">
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SHARABLE">Sharable</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {message && (
          <CardContent>
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact and personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profile.sections.personal.firstName || ""}
                    onChange={(e) =>
                      updateSection("personal", { ...profile.sections.personal, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profile.sections.personal.lastName || ""}
                    onChange={(e) =>
                      updateSection("personal", { ...profile.sections.personal, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.sections.personal.email || ""}
                    onChange={(e) => updateSection("personal", { ...profile.sections.personal, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.sections.personal.phone || ""}
                    onChange={(e) => updateSection("personal", { ...profile.sections.personal, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="City, State/Country"
                  value={profile.sections.personal.location || ""}
                  onChange={(e) =>
                    updateSection("personal", { ...profile.sections.personal, location: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea
                  placeholder="Brief overview of your professional background and goals..."
                  value={profile.sections.personal.summary || ""}
                  onChange={(e) => updateSection("personal", { ...profile.sections.personal, summary: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional work history</CardDescription>
                </div>
                <Button
                  onClick={() =>
                    addArrayItem("experience", {
                      company: "",
                      position: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                    })
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.sections.experience.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("experience", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateArrayItem("experience", index, { ...exp, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateArrayItem("experience", index, { ...exp, position: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateArrayItem("experience", index, { ...exp, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateArrayItem("experience", index, { ...exp, endDate: e.target.value })}
                        disabled={exp.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      checked={exp.current}
                      onChange={(e) => updateArrayItem("experience", index, { ...exp, current: e.target.checked })}
                    />
                    <Label htmlFor={`current-${index}`}>Currently working here</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateArrayItem("experience", index, { ...exp, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ))}

              {profile.sections.experience.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No work experience added yet. Click "Add Experience" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your educational background</CardDescription>
                </div>
                <Button
                  onClick={() =>
                    addArrayItem("education", {
                      institution: "",
                      degree: "",
                      field: "",
                      startDate: "",
                      endDate: "",
                      gpa: "",
                    })
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.sections.education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("education", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateArrayItem("education", index, { ...edu, institution: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        placeholder="Bachelor's, Master's, etc."
                        value={edu.degree}
                        onChange={(e) => updateArrayItem("education", index, { ...edu, degree: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        placeholder="Computer Science, Business, etc."
                        value={edu.field}
                        onChange={(e) => updateArrayItem("education", index, { ...edu, field: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateArrayItem("education", index, { ...edu, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateArrayItem("education", index, { ...edu, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.8"
                        value={edu.gpa}
                        onChange={(e) => updateArrayItem("education", index, { ...edu, gpa: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {profile.sections.education.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No education added yet. Click "Add Education" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Showcase your personal and professional projects</CardDescription>
                </div>
                <Button
                  onClick={() =>
                    addArrayItem("projects", {
                      name: "",
                      description: "",
                      technologies: [],
                      url: "",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.sections.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("projects", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateArrayItem("projects", index, { ...project, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project URL (Optional)</Label>
                      <Input
                        type="url"
                        placeholder="https://github.com/username/project"
                        value={project.url}
                        onChange={(e) => updateArrayItem("projects", index, { ...project, url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what the project does and your role..."
                      value={project.description}
                      onChange={(e) => updateArrayItem("projects", index, { ...project, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies Used</Label>
                    <Input
                      placeholder="React, Node.js, MongoDB (comma-separated)"
                      value={project.technologies.join(", ")}
                      onChange={(e) =>
                        updateArrayItem("projects", index, {
                          ...project,
                          technologies: e.target.value.split(",").map((t) => t.trim()),
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => updateArrayItem("projects", index, { ...project, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={project.endDate}
                        onChange={(e) => updateArrayItem("projects", index, { ...project, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {profile.sections.projects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No projects added yet. Click "Add Project" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>List your technical and professional skills</CardDescription>
                </div>
                <Button
                  onClick={() =>
                    addArrayItem("skills", {
                      name: "",
                      level: "intermediate",
                      category: "technical",
                    })
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.sections.skills.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Skill {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("skills", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Skill Name</Label>
                      <Input
                        placeholder="JavaScript, Project Management, etc."
                        value={skill.name}
                        onChange={(e) => updateArrayItem("skills", index, { ...skill, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proficiency Level</Label>
                      <Select
                        value={skill.level}
                        onValueChange={(value) => updateArrayItem("skills", index, { ...skill, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={skill.category}
                        onValueChange={(value) => updateArrayItem("skills", index, { ...skill, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="soft">Soft Skills</SelectItem>
                          <SelectItem value="language">Language</SelectItem>
                          <SelectItem value="tool">Tools & Software</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              {profile.sections.skills.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No skills added yet. Click "Add Skill" to get started.</p>
                </div>
              )}

              {profile.sections.skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Skills Preview</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.sections.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.name} ({skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
