"use client"
import { useAuth } from "../lib/auth-context.js"
import AuthPage from "../components/auth/auth-page.jsx"
import DashboardLayout from "../components/dashboard/dashboard-layout.jsx"
import TenantSetupPage from "../components/tenant/tenant-setup-page.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { User, Briefcase, Search, Plus, Users } from "lucide-react"

function CandidateDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>My Profile</CardTitle>
          </div>
          <CardDescription>Build and manage your professional profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/profile")}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <CardTitle>Job Applications</CardTitle>
          </div>
          <CardDescription>Track your job applications and status</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/applications")}>
            View Applications
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-600" />
            <CardTitle>Job Search</CardTitle>
          </div>
          <CardDescription>Find your next opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/jobs")}>
            Browse Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function RecruiterDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <CardTitle>Post New Job</CardTitle>
          </div>
          <CardDescription>Create a new job posting for your company</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/recruiter/jobs/new")}>
            Create Job Posting
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <CardTitle>Manage Jobs</CardTitle>
          </div>
          <CardDescription>View and edit your job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/recruiter/jobs")}>
            View All Jobs
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <CardTitle>Application Pipeline</CardTitle>
          </div>
          <CardDescription>Review and manage candidate applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => (window.location.href = "/recruiter/applications")}>
            View Applications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  if (user?.role === "recruiter" && !user?.tenantId) {
    return <TenantSetupPage />
  }

  return (
    <DashboardLayout>{user?.role === "candidate" ? <CandidateDashboard /> : <RecruiterDashboard />}</DashboardLayout>
  )
}
