"use client"
import { useAuth } from "../../../../lib/auth-context.js"
import DashboardLayout from "../../../../components/dashboard/dashboard-layout.jsx"
import JobForm from "../../../../components/jobs/job-form.jsx"
import { useEffect } from "react"

export default function NewJobPage() {
  const { isAuthenticated, loading, user } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "recruiter" || !user?.tenantId)) {
      window.location.href = "/"
    }
  }, [isAuthenticated, loading, user])

  const handleJobCreated = (job) => {
    window.location.href = "/recruiter/jobs"
  }

  const handleCancel = () => {
    window.location.href = "/recruiter/jobs"
  }

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

  if (!isAuthenticated || user?.role !== "recruiter" || !user?.tenantId) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <JobForm tenantId={user.tenantId} onSuccess={handleJobCreated} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}
