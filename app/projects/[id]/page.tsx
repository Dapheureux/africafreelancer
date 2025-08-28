"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, User, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import type { Project, Profile, Proposal } from "@/lib/types"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    proposedRate: "",
    estimatedDuration: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjectData()
  }, [params.id])

  const fetchProjectData = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(profile)
    }

    // Get project details
    const { data: projectData } = await supabase
      .from("projects")
      .select("*, client:profiles!projects_client_id_fkey(*)")
      .eq("id", params.id)
      .single()

    if (projectData) {
      setProject(projectData)

      // Get proposals for this project (only if user is the client)
      if (user && projectData.client_id === user.id) {
        const { data: proposalsData } = await supabase
          .from("proposals")
          .select("*, freelancer:profiles!proposals_freelancer_id_fkey(*)")
          .eq("project_id", params.id)
          .order("created_at", { ascending: false })

        if (proposalsData) setProposals(proposalsData)
      }
    }

    setIsLoading(false)
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !project) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("proposals").insert({
        project_id: project.id,
        freelancer_id: currentUser.id,
        cover_letter: proposalData.coverLetter,
        proposed_rate: Number.parseFloat(proposalData.proposedRate),
        estimated_duration: proposalData.estimatedDuration ? Number.parseInt(proposalData.estimatedDuration) : null,
      })

      if (error) throw error

      setShowProposalForm(false)
      setProposalData({ coverLetter: "", proposedRate: "", estimatedDuration: "" })
      // Refresh to show success message or redirect
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    const supabase = createClient()

    try {
      // Update proposal status
      await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposalId)

      // Update project status
      await supabase.from("projects").update({ status: "in_progress" }).eq("id", project?.id)

      // Create contract (simplified for now)
      const proposal = proposals.find((p) => p.id === proposalId)
      if (proposal) {
        await supabase.from("contracts").insert({
          project_id: project?.id,
          client_id: project?.client_id,
          freelancer_id: proposal.freelancer_id,
          proposal_id: proposalId,
          agreed_rate: proposal.proposed_rate,
        })
      }

      fetchProjectData() // Refresh data
    } catch (error) {
      console.error("Error accepting proposal:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={currentUser || undefined} />
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={currentUser || undefined} />
        <div className="flex items-center justify-center min-h-screen">Project not found</div>
      </div>
    )
  }

  const isOwner = currentUser?.id === project.client_id
  const isFreelancer = currentUser?.role === "freelancer"
  const canApply = isFreelancer && !isOwner && project.status === "open"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={currentUser || undefined} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Posted: {new Date(project.created_at).toLocaleDateString()}</span>
                      <Badge variant={project.status === "open" ? "default" : "secondary"}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Project Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.skills_required.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Form for Freelancers */}
            {canApply && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Proposal</CardTitle>
                  <CardDescription>Stand out from other freelancers with a compelling proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showProposalForm ? (
                    <Button onClick={() => setShowProposalForm(true)} className="w-full">
                      Submit Proposal
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Explain why you're the perfect fit for this project..."
                          rows={6}
                          value={proposalData.coverLetter}
                          onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proposedRate">Your Rate ($)</Label>
                          <Input
                            id="proposedRate"
                            type="number"
                            placeholder="2500"
                            value={proposalData.proposedRate}
                            onChange={(e) => setProposalData({ ...proposalData, proposedRate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedDuration">Duration (days)</Label>
                          <Input
                            id="estimatedDuration"
                            type="number"
                            placeholder="14"
                            value={proposalData.estimatedDuration}
                            onChange={(e) => setProposalData({ ...proposalData, estimatedDuration: e.target.value })}
                          />
                        </div>
                      </div>
                      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Proposal"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowProposalForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Proposals List for Project Owner */}
            {isOwner && proposals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Proposals ({proposals.length})</CardTitle>
                  <CardDescription>Review and manage proposals from freelancers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link href={`/profile/${proposal.freelancer?.id}`} className="hover:underline">
                              <h4 className="font-semibold">{proposal.freelancer?.full_name}</h4>
                            </Link>
                            <p className="text-sm text-gray-600">{proposal.freelancer?.bio}</p>
                          </div>
                          <Badge
                            className={
                              proposal.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : proposal.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{proposal.cover_letter}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium text-green-600">${proposal.proposed_rate}</span>
                            {proposal.estimated_duration && <span>{proposal.estimated_duration} days</span>}
                            <span>Submitted: {new Date(proposal.created_at).toLocaleDateString()}</span>
                          </div>
                          {proposal.status === "pending" && (
                            <Button size="sm" onClick={() => handleAcceptProposal(proposal.id)}>
                              Accept Proposal
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-green-600">
                    ${project.budget_min} - ${project.budget_max}
                  </span>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Posted: {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <Link href={`/profile/${project.client?.id}`} className="font-medium hover:underline">
                    {project.client?.full_name}
                  </Link>
                </div>
                {project.client?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{project.client.location}</span>
                  </div>
                )}
                {project.client?.bio && <p className="text-sm text-gray-600">{project.client.bio}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
