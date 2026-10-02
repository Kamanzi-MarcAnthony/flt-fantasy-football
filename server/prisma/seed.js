import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../src/config/prisma.js'

const seed = async () => {
  const name = process.env.SUPER_ADMIN_NAME
  const email = process.env.SUPER_ADMIN_EMAIL
  const password = process.env.SUPER_ADMIN_PASSWORD

  if (!name || !email || !password) {
    throw new Error('Super admin environment variables are missing')
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingAdmin) {
    console.log(`User already exists: ${email}`)
    return
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`Super admin created: ${admin.email}`)
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
