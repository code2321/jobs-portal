// Tenant model schema for MongoDB
export const TenantSchema = {
  _id: "ObjectId",
  name: "string",
  slug: "string", // for subdomain
  branding: {
    logo: "string",
    primaryColor: "string",
    secondaryColor: "string",
  },
  settings: {
    allowPublicProfiles: "boolean",
    requireApproval: "boolean",
  },
  createdAt: "Date",
  updatedAt: "Date",
}

export const createTenantIndexes = async (db) => {
  const tenants = db.collection("tenants")
  await tenants.createIndex({ slug: 1 }, { unique: true })
  await tenants.createIndex({ name: 1 })
}
