import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const skills = searchParams.get("skills")
    const location = searchParams.get("location")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const profiles = db.collection("candidateProfiles")
    const users = db.collection("users")

    // Build query for public profiles
    const query = { visibility: "PUBLIC" }

    // Add skill filter if provided
    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim())
      query["sections.skills.name"] = { $in: skillArray }
    }

    // Add location filter if provided
    if (location) {
      query["sections.personal.location"] = { $regex: location, $options: "i" }
    }

    const skip = (page - 1) * limit

    const publicProfiles = await profiles.find(query).skip(skip).limit(limit).sort({ updatedAt: -1 }).toArray()

    // Get user info for each profile
    const profilesWithUsers = await Promise.all(
      publicProfiles.map(async (profile) => {
        const user = await users.findOne(
          { _id: profile.userId },
          { projection: { firstName: 1, lastName: 1, email: 1 } },
        )
        return { ...profile, user }
      }),
    )

    const total = await profiles.countDocuments(query)

    return NextResponse.json({
      profiles: profilesWithUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Public profiles fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
