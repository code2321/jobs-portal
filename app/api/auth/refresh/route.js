import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb.js"
import { verifyRefreshToken, generateTokens } from "../../../../lib/auth.js"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 })
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const users = db.collection("users")

    // Verify user still exists
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.email, user.role)

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
