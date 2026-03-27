// Competition System Types

export type CompetitionLevel = 'DISTRICT' | 'STATE' | 'NATIONAL'
export type CompetitionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
export type CompetitionStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type ActivityType = 
  | 'TEACHER_TRAINING' 
  | 'DIGITAL_PLATFORM_ADOPTION' 
  | 'OFFLINE_SERVER' 
  | 'PARENT_ENGAGEMENT' 
  | 'DIGITAL_INNOVATION'

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaderboardType = 'DISTRICT' | 'STATE' | 'NATIONAL'

// Competition Configuration
export interface CompetitionConfig {
  level: CompetitionLevel
  startDate: Date
  endDate: Date
  submissionDeadline: Date
  resultsDate: Date
  isActive: boolean
  description: string
}

// Activity Points Configuration
export const ACTIVITY_POINTS = {
  TEACHER_TRAINING: 10,
  DIGITAL_PLATFORM_ADOPTION: 15,
  OFFLINE_SERVER: 20,
  PARENT_ENGAGEMENT: 5,
  DIGITAL_INNOVATION: 10,
  EVIDENCE_SUBMISSION: 2
} as const

// Tier Thresholds
export const TIER_THRESHOLDS = {
  BRONZE: { min: 0, max: 50 },
  SILVER: { min: 51, max: 100 },
  GOLD: { min: 101, max: 150 },
  PLATINUM: { min: 151, max: Infinity }
} as const

// Competition Timeline
export interface CompetitionTimeline {
  districtLevel: { start: Date; end: Date; results: Date }
  stateLevel: { start: Date; end: Date; results: Date }
  nationalLevel: { start: Date; end: Date; results: Date }
}

// Competition Metrics
export interface CompetitionMetrics {
  totalSchools: number
  totalSubmissions: number
  averagePoints: number
  topScore: number
  tierDistribution: Record<CompetitionTier, number>
}