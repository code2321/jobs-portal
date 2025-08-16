// MongoDB initialization script
const { connect } = require("mongodb") // Declare the connect variable
const db = connect("mongodb://localhost:27017/admin") // Declare the db variable
const recruitingDb = db.getSiblingDB("recruiting_platform")

// Create collections with proper indexes
recruitingDb.createCollection("users")
recruitingDb.createCollection("tenants")
recruitingDb.createCollection("candidateprofiles")
recruitingDb.createCollection("jobs")
recruitingDb.createCollection("applications")

// Create indexes for better performance
recruitingDb.users.createIndex({ email: 1 }, { unique: true })
recruitingDb.users.createIndex({ role: 1 })

recruitingDb.tenants.createIndex({ slug: 1 }, { unique: true })
recruitingDb.tenants.createIndex({ ownerId: 1 })

recruitingDb.candidateprofiles.createIndex({ userId: 1 }, { unique: true })
recruitingDb.candidateprofiles.createIndex({ visibility: 1 })

recruitingDb.jobs.createIndex({ tenantId: 1 })
recruitingDb.jobs.createIndex({ status: 1 })
recruitingDb.jobs.createIndex({ location: 1 })
recruitingDb.jobs.createIndex({ jobType: 1 })

recruitingDb.applications.createIndex({ jobId: 1 })
recruitingDb.applications.createIndex({ candidateId: 1 })
recruitingDb.applications.createIndex({ status: 1 })
recruitingDb.applications.createIndex({ createdAt: -1 })

print("Database initialized successfully")
