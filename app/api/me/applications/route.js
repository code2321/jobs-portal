import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { requireRole } from "../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const authResult = await requireRole(["candidate"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1]))

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const applications = db.collection("applications")
    const jobs = db.collection("jobs")
    const tenants = db.collection("tenants")

    // Build query
    const query = { candidateId: new ObjectId(decoded.userId) }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const userApplications = await applications.find(query).skip(skip).limit(limit).sort({ appliedAt: -1 }).toArray()

    // Get job and tenant info for each application
    const applicationsWithDetails = await Promise.all(
      userApplications.map(async (application) => {
        const job = await jobs.findOne({ _id: application.jobId })
        let tenant = null
        if (job) {
          tenant = await tenants.findOne({ _id: job.tenantId }, { projection: { name: 1, slug: 1, branding: 1 } })
        }
        return { ...application, job, tenant }
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
    console.error("Applications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
