export type UserRole = "client" | "freelancer" | "admin"
export type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled"
export type ProposalStatus = "pending" | "accepted" | "rejected"
export type PaymentStatus = "pending" | "escrowed" | "released" | "refunded"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  bio?: string
  skills?: string[]
  hourly_rate?: number
  location?: string
  phone?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  skills_required: string[]
  status: ProjectStatus
  deadline?: string
  created_at: string
  updated_at: string
  client?: Profile
}

export interface Proposal {
  id: string
  project_id: string
  freelancer_id: string
  cover_letter: string
  proposed_rate: number
  estimated_duration?: number
  status: ProposalStatus
  created_at: string
  updated_at: string
  freelancer?: Profile
  project?: Project
}

export interface Contract {
  id: string
  project_id: string
  client_id: string
  freelancer_id: string
  proposal_id: string
  agreed_rate: number
  start_date: string
  end_date?: string
  created_at: string
  project?: Project
  client?: Profile
  freelancer?: Profile
}

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface Review {
  id: string
  contract_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: string
  reviewer?: Profile
}

export interface Payment {
  id: string
  contract_id: string
  amount: number
  status: PaymentStatus
  escrow_date?: string
  release_date?: string
  refund_date?: string
  created_at: string
  updated_at: string
  contract?: Contract
}

export interface Transaction {
  id: string
  payment_id: string
  type: "escrow" | "release" | "refund"
  amount: number
  description: string
  created_at: string
  payment?: Payment
}
