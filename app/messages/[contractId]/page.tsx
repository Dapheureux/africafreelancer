"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Profile, Contract, Message } from "@/lib/types"

export default function ChatPage() {
  const params = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [params.contractId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!contract) return

    const supabase = createClient()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${contract.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `contract_id=eq.${contract.id}`,
        },
        (payload) => {
          console.log("[v0] New message received:", payload)
          fetchMessages() // Refetch to get sender info
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contract])

  const fetchData = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setProfile(profileData)

    // Get contract details
    const { data: contractData } = await supabase
      .from("contracts")
      .select(`
        *,
        project:projects(*),
        client:profiles!contracts_client_id_fkey(*),
        freelancer:profiles!contracts_freelancer_id_fkey(*)
      `)
      .eq("id", params.contractId)
      .single()

    if (contractData) {
      // Verify user has access to this contract
      if (contractData.client_id === user.id || contractData.freelancer_id === user.id) {
        setContract(contractData)
        await fetchMessages()
      }
    }

    setIsLoading(false)
  }

  const fetchMessages = async () => {
    const supabase = createClient()

    const { data: messagesData } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(*)")
      .eq("contract_id", params.contractId)
      .order("created_at", { ascending: true })

    if (messagesData) {
      setMessages(messagesData)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !profile || !contract) return

    setIsSending(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("messages").insert({
        contract_id: contract.id,
        sender_id: profile.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getOtherParty = () => {
    if (!profile || !contract) return null
    return profile.id === contract.client_id ? contract.freelancer : contract.client
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={profile || undefined} />
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={profile || undefined} />
        <div className="flex items-center justify-center min-h-screen">Contract not found</div>
      </div>
    )
  }

  const otherParty = getOtherParty()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile || undefined} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Chat Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              {otherParty && (
                <>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={otherParty.avatar_url || ""} alt={otherParty.full_name} />
                    <AvatarFallback>{getInitials(otherParty.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{otherParty.full_name}</CardTitle>
                      <Badge variant="secondary" className="capitalize">
                        {otherParty.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{contract.project?.title}</p>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === profile?.id
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
                className="flex-1"
              />
              <Button type="submit" disabled={isSending || !newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
