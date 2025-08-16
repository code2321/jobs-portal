// Mock data for preview mode when MongoDB isn't available

export const mockUsers = [
  {
    _id: "1",
    email: "john@example.com",
    name: "John Doe",
    role: "candidate",
    createdAt: new Date("2024-01-15"),
  },
  {
    _id: "2",
    email: "recruiter@acme.com",
    name: "Jane Smith",
    role: "recruiter",
    tenantId: "1",
    createdAt: new Date("2024-01-10"),
  },
]

export const mockTenants = [
  {
    _id: "1",
    name: "Acme Corporation",
    slug: "acme",
    description: "Leading technology company",
    website: "https://acme.com",
    logo: "/generic-company-logo.png",
    primaryColor: "#3B82F6",
    createdBy: "2",
    createdAt: new Date("2024-01-10"),
  },
]

export const mockJobs = [
  {
    _id: "1",
    title: "Senior Frontend Developer",
    description: "We are looking for an experienced frontend developer to join our team.",
    requirements: ["React", "TypeScript", "3+ years experience"],
    location: "San Francisco, CA",
    type: "full-time",
    salaryMin: 120000,
    salaryMax: 180000,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    status: "published",
    tenantId: "1",
    postedBy: "2",
    createdAt: new Date("2024-01-20"),
  },
  {
    _id: "2",
    title: "Product Manager",
    description: "Join our product team to drive innovation and growth.",
    requirements: ["Product management experience", "Technical background", "Leadership skills"],
    location: "Remote",
    type: "full-time",
    salaryMin: 140000,
    salaryMax: 200000,
    skills: ["Product Management", "Analytics", "Leadership"],
    status: "published",
    tenantId: "1",
    postedBy: "2",
    createdAt: new Date("2024-01-18"),
  },
]

export const mockProfiles = [
  {
    _id: "1",
    userId: "1",
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary: "Experienced frontend developer with 5+ years building modern web applications.",
    },
    experience: [
      {
        company: "Tech Startup",
        position: "Senior Frontend Developer",
        startDate: "2022-01",
        endDate: "present",
        description: "Led frontend development for multiple React applications.",
      },
    ],
    education: [
      {
        institution: "University of California",
        degree: "Bachelor of Science in Computer Science",
        startDate: "2016-09",
        endDate: "2020-05",
      },
    ],
    skills: ["React", "TypeScript", "Next.js", "Node.js", "Python"],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform using React and Node.js",
        technologies: ["React", "Node.js", "MongoDB"],
        url: "https://github.com/johndoe/ecommerce",
      },
    ],
    visibility: "PUBLIC",
    createdAt: new Date("2024-01-15"),
  },
]

export const mockApplications = [
  {
    _id: "1",
    jobId: "1",
    candidateId: "1",
    status: "applied",
    sharedFields: ["personalInfo", "experience", "skills"],
    coverLetter: "I am very interested in this position and believe my skills align well with your requirements.",
    createdAt: new Date("2024-01-21"),
  },
]
