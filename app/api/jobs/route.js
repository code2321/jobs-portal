import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb.js"
import { mockJobs, mockTenants } from "../../../lib/mock-data.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const skills = searchParams.get("skills")
    const location = searchParams.get("location")
    const type = searchParams.get("type")
    const remote = searchParams.get("remote")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    try {
      const client = await clientPromise
      const db = client.db("recruiting_platform")
      const jobs = db.collection("jobs")
      const tenants = db.collection("tenants")

      // Build query for active jobs only
      const query = { status: "active" }

      // Add filters
      if (skills) {
        const skillArray = skills.split(",").map((s) => s.trim())
        query.skills = { $in: skillArray }
      }

      if (location) {
        query.location = { $regex: location, $options: "i" }
      }

      if (type) {
        query.type = type
      }

      if (remote === "true") {
        query.remote = true
      }

      const skip = (page - 1) * limit

      const jobList = await jobs.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()

      // Get tenant info for each job
      const jobsWithTenants = await Promise.all(
        jobList.map(async (job) => {
          const tenant = await tenants.findOne({ _id: job.tenantId }, { projection: { name: 1, slug: 1, branding: 1 } })
          return { ...job, tenant }
        }),
      )

      const total = await jobs.countDocuments(query)

      return NextResponse.json({
        jobs: jobsWithTenants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (dbError) {
      console.log("[v0] Using mock jobs data for preview")

      let filteredJobs = [...mockJobs]

      // Apply filters to mock data
      if (skills) {
        const skillArray = skills.split(",").map((s) => s.trim())
        filteredJobs = filteredJobs.filter((job) => job.skills.some((skill) => skillArray.includes(skill)))
      }

      if (location) {
        filteredJobs = filteredJobs.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()))
      }

      if (type) {
        filteredJobs = filteredJobs.filter((job) => job.type === type)
      }

      // Add tenant info to jobs
      const jobsWithTenants = filteredJobs.map((job) => {
        const tenant = mockTenants.find((t) => t._id === job.tenantId)
        return { ...job, tenant }
      })

      // Apply pagination
      const skip = (page - 1) * limit
      const paginatedJobs = jobsWithTenants.slice(skip, skip + limit)

      return NextResponse.json({
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          total: jobsWithTenants.length,
          pages: Math.ceil(jobsWithTenants.length / limit),
        },
      })
    }
  } catch (error) {
    console.error("Public jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
