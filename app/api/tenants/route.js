import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb.js"
import { requireAuth } from "../../../lib/middleware/auth.js"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const authResult = await requireAuth(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult // Return auth error response
    }

    const { name, slug, branding = {} } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        {
          error: "Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      )
    }

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const tenants = db.collection("tenants")
    const users = db.collection("users")

    // Check if slug is already taken
    const existingTenant = await tenants.findOne({ slug })
    if (existingTenant) {
      return NextResponse.json({ error: "Company slug is already taken" }, { status: 400 })
    }

    // Create new tenant
    const newTenant = {
      _id: new ObjectId(),
      name,
      slug,
      branding: {
        logo: branding.logo || "",
        primaryColor: branding.primaryColor || "#3b82f6",
        secondaryColor: branding.secondaryColor || "#1e40af",
      },
      settings: {
        allowPublicProfiles: true,
        requireApproval: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await tenants.insertOne(newTenant)

    // Update user to be associated with this tenant and change role to recruiter
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1])) // Simple JWT decode for user ID

    await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          tenantId: newTenant._id,
          role: "recruiter",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      tenant: newTenant,
      message: "Company created successfully",
    })
  } catch (error) {
    console.error("Tenant creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const authResult = await requireAuth(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const tenants = db.collection("tenants")

    const allTenants = await tenants.find({}).toArray()

    return NextResponse.json({ tenants: allTenants })
  } catch (error) {
    console.error("Tenants fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
