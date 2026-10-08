import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      type: 'refresh',
      userId,
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h',
    },
  )
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

if (!user || !user.isActive) {
  return res.status(401).json({
    success: false,
    message: 'Invalid email or password',
  })
}

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Short-lived access token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      },
    )

    // Long-lived refresh token
  const refreshToken = generateRefreshToken(user.id)

    // Store only the hashed refresh token
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      12,
    )

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash,
      },
    })

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      })
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET,
    )

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

const user = await prisma.user.findUnique({
  where: {
    id: decoded.userId,
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    refreshTokenHash: true,
  },
})

if (
  !user ||
  !user.refreshTokenHash ||
  !(await bcrypt.compare(
    refreshToken,
    user.refreshTokenHash,
  ))
) {
  return res.status(401).json({
    success: false,
    message: 'Invalid refresh token',
  })
}

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      })
    }

    // Create a new short-lived access token
    const newToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      },
    )

    // Rotate the refresh token.
    // This gives the active session another 2 hours.
    const newRefreshToken = generateRefreshToken(user.id)

    const newRefreshTokenHash = await bcrypt.hash(
      newRefreshToken,
      12,
    )

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    })

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Refresh token error:', error)

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    })
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create fantasy user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: passwordHash,
        role: 'FANTASY_USER',
        isActive: true,
      },
    })

    // Generate access token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      },
    )

    // Generate refresh token
    const refreshToken = generateRefreshToken(user.id)

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      12,
    )

    // Store hashed refresh token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    })
  }
}