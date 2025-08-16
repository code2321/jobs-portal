import { NextResponse } from "next/server"
import clientPromise from "../../../../../lib/mongodb.js"
import { requireRole } from "../../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    const authResult = await requireRole(["candidate"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: jobId } = params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1]))

    const { shareSet } = await request.json()

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const applications = db.collection("applications")
    const jobs = db.collection("jobs")

    // Check if job exists and is active
    const job = await jobs.findOne({ _id: new ObjectId(jobId) })
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.status !== "active") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await applications.findOne({
      jobId: new ObjectId(jobId),
      candidateId: new ObjectId(decoded.userId),
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
    }

    // Create new application
    const newApplication = {
      _id: new ObjectId(),
      jobId: new ObjectId(jobId),
      candidateId: new ObjectId(decoded.userId),
      shareSet: shareSet || {},
      status: "applied",
      stage: "applied",
      notes: "",
      appliedAt: new Date(),
      updatedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
    }

    await applications.insertOne(newApplication)

    // Update job applications count
    await jobs.updateOne({ _id: new ObjectId(jobId) }, { $inc: { applicationsCount: 1 } })

    return NextResponse.json({
      application: newApplication,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
