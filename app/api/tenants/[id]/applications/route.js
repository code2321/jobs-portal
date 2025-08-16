import { NextResponse } from "next/server"
import clientPromise from "../../../../../lib/mongodb.js"
import { requireRole } from "../../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const authResult = await requireRole(["recruiter", "admin"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: tenantId } = params
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const applications = db.collection("applications")
    const jobs = db.collection("jobs")
    const users = db.collection("users")

    // Build query - get applications for jobs belonging to this tenant
    let jobIds = []
    if (jobId) {
      jobIds = [new ObjectId(jobId)]
    } else {
      const tenantJobs = await jobs.find({ tenantId: new ObjectId(tenantId) }).toArray()
      jobIds = tenantJobs.map((job) => job._id)
    }

    const query = { jobId: { $in: jobIds } }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const applicationList = await applications.find(query).skip(skip).limit(limit).sort({ appliedAt: -1 }).toArray()

    // Get job and candidate info for each application
    const applicationsWithDetails = await Promise.all(
      applicationList.map(async (application) => {
        const job = await jobs.findOne({ _id: application.jobId })
        const candidate = await users.findOne(
          { _id: application.candidateId },
          { projection: { firstName: 1, lastName: 1, email: 1 } },
        )
        return { ...application, job, candidate }
      }),
    )

    const total = await applications.countDocuments(query)

    return NextResponse.json({
      applications: applicationsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Tenant applications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
