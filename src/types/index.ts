// This file contains type definitions that are commonly used across the application

// String literal types for TypeScript
export type EvidenceType = 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SPEED_TEST' | 'SCREENSHOT' | 'TEXT'
export type CertificateType = 'SCHOOL_CERTIFICATION' | 'EDUCATOR_BADGE' | 'COURSE_COMPLETION' | 'ACHIEVEMENT'
export type CertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED'
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
export type UserRole = 'SCHOOL_ADMIN' | 'EDUCATOR' | 'INTERNAL_ADMIN'
export type SchoolType = 'PRIMARY' | 'SECONDARY' | 'SENIOR_SECONDARY' | 'HIGHER_SECONDARY' | 'INTERNATIONAL' | 'SPECIAL_EDUCATION'
export type MembershipTier = 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM'
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type NotificationType = 'SYSTEM' | 'CERTIFICATION' | 'COURSE_UPDATE' | 'ACHIEVEMENT' | 'REMINDER' | 'ANNOUNCEMENT' | 'ALERT' | 'COMPETITION_DEADLINE' | 'TIER_UPGRADE' | 'ACTIVITY_APPROVED' | 'COMPETITION_STARTED' | 'COMPETITION_COMPLETED'
export type ResourceType = 'DOCUMENT' | 'VIDEO' | 'TEMPLATE' | 'WHITEPAPER' | 'LESSON_PLAN' | 'POLICY_GUIDE' | 'SOFTWARE_TOOL'

// Competition Types
export type CompetitionLevel = 'DISTRICT' | 'STATE' | 'NATIONAL'
export type CompetitionStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type CompetitionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
export type ActivityType = 'TEACHER_TRAINING' | 'ACADEMY_ADOPTION' | 'OFFLINE_SERVER' | 'PARENT_ENGAGEMENT' | 'DIGITAL_INNOVATION'
export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaderboardType = 'DISTRICT' | 'STATE' | 'NATIONAL'