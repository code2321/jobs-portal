import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { requireAuth } from "../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const authResult = await requireAuth(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const applications = db.collection("applications")
    const jobs = db.collection("jobs")
    const tenants = db.collection("tenants")
    const users = db.collection("users")

    const application = await applications.findOne({ _id: new ObjectId(id) })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get related data
    const job = await jobs.findOne({ _id: application.jobId })
    const tenant = job ? await tenants.findOne({ _id: job.tenantId }) : null
    const candidate = await users.findOne(
      { _id: application.candidateId },
      { projection: { firstName: 1, lastName: 1, email: 1 } },
    )

    return NextResponse.json({
      application: {
        ...application,
        job,
        tenant,
        candidate,
      },
    })
  } catch (error) {
    console.error("Application fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const authResult = await requireAuth(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params
    const updates = await request.json()
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1]))

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const applications = db.collection("applications")

    // Add reviewer info if status is being updated by recruiter
    if (updates.status && decoded.role === "recruiter") {
      updates.reviewedBy = new ObjectId(decoded.userId)
      updates.reviewedAt = new Date()
    }

    const result = await applications.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const updatedApplication = await applications.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      application: updatedApplication,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Application update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
