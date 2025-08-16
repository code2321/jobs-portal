import { NextResponse } from "next/server"
import clientPromise from "../../../../../lib/mongodb.js"
import { requireRole } from "../../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const jobs = db.collection("jobs")

    // Build query
    const query = { tenantId: new ObjectId(id) }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const jobList = await jobs.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()

    const total = await jobs.countDocuments(query)

    return NextResponse.json({
      jobs: jobList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const authResult = await requireRole(["recruiter", "admin"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1]))

    const jobData = await request.json()

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const jobs = db.collection("jobs")

    const newJob = {
      _id: new ObjectId(),
      tenantId: new ObjectId(id),
      title: jobData.title,
      department: jobData.department || "",
      location: jobData.location,
      type: jobData.type,
      remote: jobData.remote || false,
      skills: jobData.skills || [],
      salaryRange: {
        min: jobData.salaryRange?.min || 0,
        max: jobData.salaryRange?.max || 0,
        currency: jobData.salaryRange?.currency || "USD",
      },
      description: jobData.description,
      requirements: jobData.requirements || "",
      benefits: jobData.benefits || "",
      status: jobData.status || "draft",
      openAt: jobData.openAt ? new Date(jobData.openAt) : new Date(),
      closeAt: jobData.closeAt ? new Date(jobData.closeAt) : null,
      applicationsCount: 0,
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await jobs.insertOne(newJob)

    return NextResponse.json({
      job: newJob,
      message: "Job created successfully",
    })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
