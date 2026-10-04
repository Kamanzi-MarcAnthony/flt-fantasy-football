import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'

export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json({
      success: true,
      data: {
        admins,
      },
    })
  } catch (error) {
    console.error('Get admins error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch admins',
    })
  }
}

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {}

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    const adminRole = role || 'ADMIN'

    if (!['ADMIN', 'SUPER_ADMIN'].includes(adminRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin role',
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: adminRole,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin,
      },
    })
  } catch (error) {
    console.error('Create admin error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create admin',
    })
  }
}

export const updateAdmin = async (req, res) => {
  try {
    const adminId = Number(req.params.id)
    const { name, email, role } = req.body || {}

    if (!Number.isInteger(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID',
      })
    }

    if (!name && !email && !role) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required',
      })
    }

    if (
      role &&
      !['ADMIN', 'SUPER_ADMIN'].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin role',
      })
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    })

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    if (
      !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an admin',
      })
    }

    if (email && email !== admin.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
        })
      }
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: adminId,
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        admin: updatedAdmin,
      },
    })
  } catch (error) {
    console.error('Update admin error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update admin',
    })
  }
}

export const updateAdminStatus = async (req, res) => {
  try {
    const adminId = Number(req.params.id)
    const { isActive } = req.body || {}

    if (!Number.isInteger(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID',
      })
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false',
      })
    }

    // Prevent a Super Admin from deactivating themselves
    if (adminId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      })
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    })

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    if (
      !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an admin',
      })
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: adminId,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return res.json({
      success: true,
      message: isActive
        ? 'Admin activated successfully'
        : 'Admin deactivated successfully',
      data: {
        admin: updatedAdmin,
      },
    })
  } catch (error) {
    console.error('Update admin status error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update admin status',
    })
  }
}

export const resetAdminPassword = async (req, res) => {
  try {
    const adminId = Number(req.params.id)
    const { password } = req.body || {}

    if (!Number.isInteger(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID',
      })
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    })

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    if (
      !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an admin',
      })
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12,
    )

    await prisma.user.update({
      where: {
        id: adminId,
      },
      data: {
        password: hashedPassword,

        // Invalidate existing refresh token
        refreshTokenHash: null,
      },
    })

    return res.json({
      success: true,
      message: 'Admin password reset successfully',
    })
  } catch (error) {
    console.error(
      'Reset admin password error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to reset admin password',
    })
  }
}

export const getFantasyUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'FANTASY_USER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,

        fantasyMemberships: {
          select: {
            league: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        fantasyTeams: {
          select: {
            id: true,
            name: true,
            leagueId: true,
          },
        },
      },
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      leagues: user.fantasyMemberships.map(
        (membership) => membership.league,
      ),
      teams: user.fantasyTeams,
    }))

    return res.json({
      success: true,
      data: {
        users: formattedUsers,
      },
    })
  } catch (error) {
    console.error('Get fantasy users error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load fantasy users',
    })
  }
}

export const deleteFantasyUser = async (req, res) => {
  try {
    const userId = Number(req.params.id)

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Fantasy user not found',
      })
    }

    if (user.role !== 'FANTASY_USER') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete fantasy users',
      })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return res.json({
      success: true,
      message: 'Fantasy user deleted successfully',
    })
  } catch (error) {
    console.error('Delete fantasy user error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete fantasy user',
    })
  }
}