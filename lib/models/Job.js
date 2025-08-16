// Job model schema for MongoDB
export const JobSchema = {
  _id: "ObjectId",
  tenantId: "ObjectId",
  title: "string",
  department: "string",
  location: "string",
  type: "string", // 'full-time', 'part-time', 'contract', 'internship'
  remote: "boolean",
  skills: ["string"],
  salaryRange: {
    min: "number",
    max: "number",
    currency: "string",
  },
  description: "string",
  requirements: "string",
  benefits: "string",
  status: "string", // 'draft', 'active', 'paused', 'closed'
  openAt: "Date",
  closeAt: "Date",
  applicationsCount: "number",
  createdBy: "ObjectId",
  createdAt: "Date",
  updatedAt: "Date",
}

export const createJobIndexes = async (db) => {
  const jobs = db.collection("jobs")
  await jobs.createIndex({ tenantId: 1 })
  await jobs.createIndex({ status: 1 })
  await jobs.createIndex({ skills: 1 })
  await jobs.createIndex({ location: 1 })
  await jobs.createIndex({ type: 1 })
  await jobs.createIndex({ createdAt: -1 })
}
