"use client"
import { useAuth } from "../../lib/auth-context.js"
import DashboardLayout from "../../components/dashboard/dashboard-layout.jsx"
import ProfileForm from "../../components/profile/profile-form.jsx"
import { useEffect } from "react"

export default function ProfilePage() {
  const { isAuthenticated, loading, user } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "candidate")) {
      window.location.href = "/"
    }
  }, [isAuthenticated, loading, user])

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

  if (!isAuthenticated || user?.role !== "candidate") {
    return null
  }

  return (
    <DashboardLayout>
      <ProfileForm />
    </DashboardLayout>
  )
}
