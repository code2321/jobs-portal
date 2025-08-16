"use client"
import { useAuth } from "../../lib/auth-context.js"
import Navbar from "../layout/navbar.jsx"

export default function DashboardLayout({ children }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === "candidate" ? "Candidate Dashboard" : "Recruiter Dashboard"}
          </h2>
          <p className="text-gray-600">
            {user?.role === "candidate"
              ? "Manage your profile and track applications"
              : "Manage job postings and review candidates"}
          </p>
        </div>
        {children}
      </main>
    </div>
  )
}
