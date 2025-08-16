"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"

export default function CreateTenantForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    branding: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (value) => {
    handleChange("name", value)
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleChange("slug", generateSlug(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create company")
      }

      onSuccess?.(data.tenant)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Company Portal</CardTitle>
        <CardDescription>Set up your company's job portal with a custom subdomain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Company Slug</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="slug"
                placeholder="acme-corp"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                required
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.jobs.yourdomain.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This will be your company's job portal URL. Use only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleChange("branding.primaryColor", e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleChange("branding.primaryColor", e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.branding.secondaryColor}
                  onChange={(e) => handleChange("branding.secondaryColor", e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.branding.secondaryColor}
                  onChange={(e) => handleChange("branding.secondaryColor", e.target.value)}
                  placeholder="#1e40af"
                />
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="text-sm text-muted-foreground">
              Your job portal will be available at: <br />
              <span className="font-mono bg-background px-2 py-1 rounded">
                {formData.slug || "your-company"}.jobs.yourdomain.com
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Company..." : "Create Company Portal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
