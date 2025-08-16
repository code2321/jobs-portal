import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { verifyPassword, generateTokens } from "../../../../lib/auth.js"
import { mockUsers } from "../../../../lib/mock-data.js"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    try {
      const client = await clientPromise
      const db = client.db("recruiting_platform")
      const users = db.collection("users")

      // Find user by email
      const user = await users.findOne({ email })
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.email, user.role)

      // Return user data without password
      const { passwordHash: _, ...userWithoutPassword } = user

      return NextResponse.json({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      })
    } catch (dbError) {
      console.log("[v0] Using mock authentication for preview")

      // Simple mock authentication - accept any password for demo users
      const mockUser = mockUsers.find((u) => u.email === email)
      if (!mockUser) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Generate mock tokens
      const { accessToken, refreshToken } = generateTokens(mockUser._id, mockUser.email, mockUser.role)

      return NextResponse.json({
        user: mockUser,
        accessToken,
        refreshToken,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
