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

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const profiles = db.collection("candidateProfiles")

    const profile = await profiles.findOne({ userId: new ObjectId(decoded.userId) })

    if (!profile) {
      // Return empty profile structure if none exists
      return NextResponse.json({
        profile: {
          userId: decoded.userId,
          sections: {
            personal: {},
            education: [],
            experience: [],
            projects: [],
            skills: [],
          },
          visibility: "PRIVATE",
        },
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const authResult = await requireRole(["candidate"])(async (req, res) => {
      return { req, res }
    })(request, NextResponse)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = JSON.parse(atob(token.split(".")[1]))

    const updates = await request.json()

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const profiles = db.collection("candidateProfiles")

    const existingProfile = await profiles.findOne({ userId: new ObjectId(decoded.userId) })

    if (existingProfile) {
      // Update existing profile
      const result = await profiles.updateOne(
        { userId: new ObjectId(decoded.userId) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }
    } else {
      // Create new profile
      const newProfile = {
        _id: new ObjectId(),
        userId: new ObjectId(decoded.userId),
        sections: {
          personal: {},
          education: [],
          experience: [],
          projects: [],
          skills: [],
        },
        visibility: "PRIVATE",
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await profiles.insertOne(newProfile)
    }

    const updatedProfile = await profiles.findOne({ userId: new ObjectId(decoded.userId) })

    return NextResponse.json({
      profile: updatedProfile,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
