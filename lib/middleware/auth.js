import { verifyToken, extractTokenFromHeader } from "../auth.js"

export const requireAuth = (handler) => {
  return async (req, res) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization)

      if (!token) {
        return res.status(401).json({ error: "No token provided" })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" })
      }

      req.user = decoded
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: "Authentication failed" })
    }
  }
}

export const requireRole = (roles) => {
  return (handler) => {
    return requireAuth(async (req, res) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }
      return handler(req, res)
    })
  }
}
