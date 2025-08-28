"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import type { Profile, Contract } from "@/lib/types"

export default function MessagesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setProfile(profileData)

    if (profileData) {
      // Get contracts where user is either client or freelancer
      const { data: contractsData } = await supabase
        .from("contracts")
        .select(`
          *,
          project:projects(*),
          client:profiles!contracts_client_id_fkey(*),
          freelancer:profiles!contracts_freelancer_id_fkey(*)
        `)
        .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (contractsData) {
        setContracts(contractsData)
      }
    }

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getOtherParty = (contract: Contract) => {
    if (!profile) return null
    return profile.id === contract.client_id ? contract.freelancer : contract.client
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={profile || undefined} />
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile || undefined} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your clients and freelancers</p>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500">
                Start working on projects to begin conversations with{" "}
                {profile?.role === "client" ? "freelancers" : "clients"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => {
              const otherParty = getOtherParty(contract)
              if (!otherParty) return null

              return (
                <Link key={contract.id} href={`/messages/${contract.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherParty.avatar_url || ""} alt={otherParty.full_name} />
                          <AvatarFallback>{getInitials(otherParty.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg">{otherParty.full_name}</h3>
                            <Badge variant="secondary" className="capitalize">
                              {otherParty.role}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{contract.project?.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Contract started: {new Date(contract.start_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
