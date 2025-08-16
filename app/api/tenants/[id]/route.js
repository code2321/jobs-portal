import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { requireRole } from "../../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const tenants = db.collection("tenants")

    const tenant = await tenants.findOne({ _id: new ObjectId(id) })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error("Tenant fetch error:", error)
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
    const tenants = db.collection("tenants")

    const result = await tenants.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const updatedTenant = await tenants.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      tenant: updatedTenant,
      message: "Tenant updated successfully",
    })
  } catch (error) {
    console.error("Tenant update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
