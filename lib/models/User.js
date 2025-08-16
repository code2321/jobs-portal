// User model schema for MongoDB
export const UserSchema = {
  _id: "ObjectId",
  email: "string",
  passwordHash: "string",
  role: "string", // 'candidate', 'recruiter', 'admin'
  tenantId: "ObjectId", // null for candidates, set for recruiters
  firstName: "string",
  lastName: "string",
  createdAt: "Date",
  updatedAt: "Date",
}

export const createUserIndexes = async (db) => {
  const users = db.collection("users")
  await users.createIndex({ email: 1 }, { unique: true })
  await users.createIndex({ tenantId: 1 })
  await users.createIndex({ role: 1 })
}
