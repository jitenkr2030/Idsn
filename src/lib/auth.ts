import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  schoolId?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  phone?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      schoolId: user.schoolId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email: credentials.email },
    include: {
      schoolProfile: true,
      educatorProfile: true,
      adminProfile: true
    }
  })

  if (!user || !user.isActive) {
    return null
  }

  const isPasswordValid = await verifyPassword(credentials.password, user.password)
  if (!isPasswordValid) {
    return null
  }

  // Get schoolId based on user role
  let schoolId: string | undefined
  if (user.role === 'SCHOOL_ADMIN' && user.schoolProfile) {
    schoolId = user.schoolProfile.schoolId
  } else if (user.role === 'EDUCATOR' && user.educatorProfile) {
    schoolId = user.educatorProfile.schoolId
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    schoolId
  }
}

export async function createUser(data: RegisterData): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      ...data,
      password: hashedPassword
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  })

  return user
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() }
  })
}

export function hasRole(user: AuthUser, roles: UserRole[]): boolean {
  return roles.includes(user.role)
}

export function isSchoolAdmin(user: AuthUser): boolean {
  return user.role === 'SCHOOL_ADMIN'
}

export function isEducator(user: AuthUser): boolean {
  return user.role === 'EDUCATOR'
}

export function isInternalAdmin(user: AuthUser): boolean {
  return user.role === 'INTERNAL_ADMIN'
}