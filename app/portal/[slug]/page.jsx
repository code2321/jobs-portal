"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Building2, Search, Briefcase } from "lucide-react"
import JobCard from "../../../components/jobs/job-card.jsx"

export default function TenantPortalPage({ params }) {
  const [tenant, setTenant] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    type: "all", // Updated default value to "all"
  })

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        // Fetch tenant info
        const tenantResponse = await fetch(`/api/tenants/by-slug/${params.slug}`)
        if (!tenantResponse.ok) {
          throw new Error("Company not found")
        }
        const tenantData = await tenantResponse.json()
        setTenant(tenantData.tenant)

        // Fetch jobs for this tenant
        const jobsResponse = await fetch(`/api/tenants/${tenantData.tenant._id}/jobs?status=active`)
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setJobs(jobsData.jobs || [])
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [params.slug])

  const handleApply = (job) => {
    // This will be implemented in the next task
    console.log("Apply to job:", job._id)
    alert("Application functionality will be available in the next update!")
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !filters.search || job.title.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = !filters.type || job.type === filters.type
    return matchesSearch && matchesType
  })

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Company Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const brandingStyle = {
    "--primary-color": tenant?.branding?.primaryColor || "#3b82f6",
    "--secondary-color": tenant?.branding?.secondaryColor || "#1e40af",
  }

  return (
    <div className="min-h-screen bg-gray-50" style={brandingStyle}>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8" style={{ color: "var(--primary-color)" }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tenant?.name}</h1>
                <p className="text-gray-600">Join our team</p>
              </div>
            </div>
            <Badge variant="secondary">{params.slug}.jobs.yourdomain.com</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
          <p className="text-gray-600">Discover exciting career opportunities at {tenant?.name}</p>
        </div>

        {/* Search and Filter */}
        {jobs.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Jobs</label>
                  <Input
                    placeholder="Job title or keywords..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Type</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem> {/* Updated value prop */}
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setFilters({ search: "", type: "all" })} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <JobCard key={job._id} job={job} onApply={handleApply} showCompany={false} />)
          ) : jobs.length > 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Match Your Search</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria.</p>
                <Button onClick={() => setFilters({ search: "", type: "all" })} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Positions</h3>
                <p className="text-gray-600">
                  {tenant?.name} doesn't have any open positions at the moment. Check back later for new opportunities!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
