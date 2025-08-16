import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { requireRole } from "../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const jobs = db.collection("jobs")
    const tenants = db.collection("tenants")

    const job = await jobs.findOne({ _id: new ObjectId(id) })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get tenant info
    const tenant = await tenants.findOne({ _id: job.tenantId }, { projection: { name: 1, slug: 1, branding: 1 } })

    return NextResponse.json({ job: { ...job, tenant } })
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const authResult = await requireRole(["recruiter", "admin"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params
    const updates = await request.json()

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const jobs = db.collection("jobs")

    const result = await jobs.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const updatedJob = await jobs.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      job: updatedJob,
      message: "Job updated successfully",
    })
  } catch (error) {
    console.error("Job update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireRole(["recruiter", "admin"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const jobs = db.collection("jobs")

    const result = await jobs.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Job deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
