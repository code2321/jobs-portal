import { NextResponse } from "next/server"
import clientPromise from "../../../../../lib/mongodb.js"

export async function GET(request, { params }) {
  try {
    const { slug } = params

    const client = await clientPromise
    const db = client.db("recruiting_platform")
    const tenants = db.collection("tenants")

    const tenant = await tenants.findOne({ slug })

    if (!tenant) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error("Tenant by slug fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
