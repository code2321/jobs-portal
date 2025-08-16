import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { hashPassword, generateTokens } from "../../../../lib/auth.js"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const { email, password, firstName, lastName, role = "candidate" } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const newUser = {
      _id: new ObjectId(),
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      tenantId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(newUser)

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id.toString(), newUser.email, newUser.role)

    // Return user data without password
    const { passwordHash: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
