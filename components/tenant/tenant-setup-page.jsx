"use client"
import { useState } from "react"
import { useAuth } from "../../lib/auth-context.js"
import CreateTenantForm from "./create-tenant-form.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Building2, Users, Briefcase, BarChart3 } from "lucide-react"

export default function TenantSetupPage() {
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()

  const handleTenantCreated = (tenant) => {
    // Refresh the page or redirect to dashboard
    window.location.reload()
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <CreateTenantForm onSuccess={handleTenantCreated} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to RecruiterPro, {user?.firstName}!</h1>
          <p className="text-xl text-gray-600">Create your company's job portal and start hiring top talent</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Custom Job Portal</CardTitle>
              <CardDescription>Get your own branded subdomain like acme.jobs.yourdomain.com</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Candidate Management</CardTitle>
              <CardDescription>Track applications and manage your hiring pipeline</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Job Posting</CardTitle>
              <CardDescription>Create and manage job listings with detailed requirements</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>Get insights into your hiring process and candidate engagement</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
            <CardDescription>Set up your company portal in just a few minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              Create Company Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
