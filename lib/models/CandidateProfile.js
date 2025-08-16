// CandidateProfile model schema for MongoDB
export const CandidateProfileSchema = {
  _id: "ObjectId",
  userId: "ObjectId",
  sections: {
    personal: {
      firstName: "string",
      lastName: "string",
      email: "string",
      phone: "string",
      location: "string",
      summary: "string",
    },
    education: [
      {
        institution: "string",
        degree: "string",
        field: "string",
        startDate: "Date",
        endDate: "Date",
        gpa: "number",
      },
    ],
    experience: [
      {
        company: "string",
        position: "string",
        description: "string",
        startDate: "Date",
        endDate: "Date",
        current: "boolean",
      },
    ],
    projects: [
      {
        name: "string",
        description: "string",
        technologies: ["string"],
        url: "string",
        startDate: "Date",
        endDate: "Date",
      },
    ],
    skills: [
      {
        name: "string",
        level: "string", // 'beginner', 'intermediate', 'advanced', 'expert'
        category: "string",
      },
    ],
  },
  visibility: "string", // 'PRIVATE', 'SHARABLE', 'PUBLIC'
  createdAt: "Date",
  updatedAt: "Date",
}

export const createCandidateProfileIndexes = async (db) => {
  const profiles = db.collection("candidateProfiles")
  await profiles.createIndex({ userId: 1 }, { unique: true })
  await profiles.createIndex({ visibility: 1 })
  await profiles.createIndex({ "sections.skills.name": 1 })
}
