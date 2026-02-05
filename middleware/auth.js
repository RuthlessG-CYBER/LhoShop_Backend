import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Not authorized" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.admin = decoded

    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

