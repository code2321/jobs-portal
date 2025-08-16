// Application model schema for MongoDB
export const ApplicationSchema = {
  _id: "ObjectId",
  jobId: "ObjectId",
  candidateId: "ObjectId",
  shareSet: {
    personal: "object",
    education: "array",
    experience: "array",
    projects: "array",
    skills: "array",
  },
  status: "string", // 'applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'
  stage: "string", // 'applied', 'phone_screen', 'technical', 'onsite', 'final', 'offer'
  notes: "string",
  appliedAt: "Date",
  updatedAt: "Date",
  reviewedBy: "ObjectId",
  reviewedAt: "Date",
}

export const createApplicationIndexes = async (db) => {
  const applications = db.collection("applications")
  await applications.createIndex({ jobId: 1 })
  await applications.createIndex({ candidateId: 1 })
  await applications.createIndex({ status: 1 })
  await applications.createIndex({ appliedAt: -1 })
  await applications.createIndex({ jobId: 1, candidateId: 1 }, { unique: true })
}
