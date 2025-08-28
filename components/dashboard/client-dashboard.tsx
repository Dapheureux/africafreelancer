"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Users, DollarSign, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { Profile, Project, Contract } from "@/lib/types"

interface ClientDashboardProps {
  profile: Profile
}

export function ClientDashboard({ profile }: ClientDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalSpent: 0,
    activeContracts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", profile.id)
      .order("created_at", { ascending: false })

    const { data: contractsData } = await supabase
      .from("contracts")
      .select(`
        *,
        project:projects(*),
        freelancer:profiles!contracts_freelancer_id_fkey(*)
      `)
      .eq("client_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (projectsData) {
      setProjects(projectsData)
      setStats((prev) => ({
        ...prev,
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter((p) => p.status === "open" || p.status === "in_progress").length,
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
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
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
          <p className="text-gray-600">Manage your projects and find the best freelancers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
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
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Projects List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Manage and track your posted projects</CardDescription>
                </div>
                <Link href="/projects/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Project
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven&apos;t posted any projects yet</p>
                  <Link href="/projects/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Budget: ${project.budget_min} - ${project.budget_max}
                            </span>
                            <span>Posted: {new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Contracts</CardTitle>
                  <CardDescription>Active work with freelancers</CardDescription>
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
              {contracts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active contracts</p>
                </div>
              ) : (
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
                      <p className="text-sm text-gray-600 mb-2">Working with: {contract.freelancer?.full_name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Rate: ${contract.agreed_rate}</span>
                        <span>Started: {new Date(contract.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
