"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, DollarSign, Star, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { Profile, Project, Proposal, Contract } from "@/lib/types"

interface FreelancerDashboardProps {
  profile: Profile
}

export function FreelancerDashboard({ profile }: FreelancerDashboardProps) {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [myProposals, setMyProposals] = useState<Proposal[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState({
    activeProposals: 0,
    completedProjects: 0,
    totalEarnings: 0,
    activeContracts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch recent open projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*, client:profiles!projects_client_id_fkey(*)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(5)

    // Fetch user's proposals
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*, project:projects(*)")
      .eq("freelancer_id", profile.id)
      .order("created_at", { ascending: false })

    const { data: contractsData } = await supabase
      .from("contracts")
      .select(`
        *,
        project:projects(*),
        client:profiles!contracts_client_id_fkey(*)
      `)
      .eq("freelancer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (projectsData) setRecentProjects(projectsData)
    if (proposalsData) {
      setMyProposals(proposalsData)
      setStats((prev) => ({
        ...prev,
        activeProposals: proposalsData.filter((p) => p.status === "pending").length,
      }))
    }
    if (contractsData) {
      setContracts(contractsData)
      setStats((prev) => ({
        ...prev,
        activeContracts: contractsData.length,
      }))
    }

    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name}</h1>
          <p className="text-gray-600">Find your next project and grow your freelance career</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProposals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest opportunities that match your skills</CardDescription>
                </div>
                <Link href="/projects/browse">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Browse All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No projects available</p>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">
                          ${project.budget_min} - ${project.budget_max}
                        </span>
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* My Proposals */}
            <Card>
              <CardHeader>
                <CardTitle>My Proposals</CardTitle>
                <CardDescription>Track your submitted proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {myProposals.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">You haven&apos;t submitted any proposals yet</p>
                    <Link href="/projects/browse">
                      <Button variant="outline">Browse Projects</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myProposals.slice(0, 3).map((proposal) => (
                      <div key={proposal.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{proposal.project?.title}</h4>
                          <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Proposed Rate: ${proposal.proposed_rate}</span>
                          <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Contracts */}
            {contracts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Contracts</CardTitle>
                      <CardDescription>Current work with clients</CardDescription>
                    </div>
                    <Link href="/messages">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <div key={contract.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{contract.project?.title}</h4>
                          <Link href={`/messages/${contract.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Client: {contract.client?.full_name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Rate: ${contract.agreed_rate}</span>
                          <span>Started: {new Date(contract.start_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
