"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Proposal, Project } from "@/lib/types"

interface ProposalWithDetails extends Proposal {
  project: Project
  freelancer: { full_name: string; email: string }
}

export default function CreateContractPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const proposalId = searchParams.get("proposal")

  const [proposal, setProposal] = useState<ProposalWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    agreed_rate: "",
    start_date: "",
    end_date: "",
    payment_amount: "",
    payment_terms: "",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchProposal() {
      if (!proposalId) return

      const { data } = await supabase
        .from("proposals")
        .select(`
          *,
          project:projects(*),
          freelancer:profiles!proposals_freelancer_id_fkey(full_name, email)
        `)
        .eq("id", proposalId)
        .single()

      if (data) {
        setProposal(data)
        setFormData((prev) => ({
          ...prev,
          agreed_rate: data.proposed_rate.toString(),
          payment_amount: data.proposed_rate.toString(),
        }))
      }
      setLoading(false)
    }

    fetchProposal()
  }, [proposalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposal) return

    setCreating(true)

    try {
      // Create contract
      const { data: contract, error: contractError } = await supabase
        .from("contracts")
        .insert({
          project_id: proposal.project_id,
          client_id: proposal.project.client_id,
          freelancer_id: proposal.freelancer_id,
          proposal_id: proposal.id,
          agreed_rate: Number.parseFloat(formData.agreed_rate),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        })
        .select()
        .single()

      if (contractError) throw contractError

      // Create initial payment in escrow
      const { error: paymentError } = await supabase.from("payments").insert({
        contract_id: contract.id,
        amount: Number.parseFloat(formData.payment_amount),
        status: "escrowed",
        escrow_date: new Date().toISOString(),
      })

      if (paymentError) throw paymentError

      // Create escrow transaction
      const { data: payment } = await supabase.from("payments").select("id").eq("contract_id", contract.id).single()

      if (payment) {
        await supabase.from("transactions").insert({
          payment_id: payment.id,
          type: "escrow",
          amount: Number.parseFloat(formData.payment_amount),
          description: "Paiement initial mis en escrow",
        })
      }

      // Update proposal status
      await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposal.id)

      // Update project status
      await supabase.from("projects").update({ status: "in_progress" }).eq("id", proposal.project_id)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating contract:", error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Proposition non trouvée</h1>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Retour au dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Créer un Contrat</h1>
        <p className="text-gray-600 mt-2">Finalisez les détails du contrat et du paiement</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Proposal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la Proposition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{proposal.project.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{proposal.project.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-medium">{proposal.freelancer.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux proposé:</span>
              <span className="font-medium">${proposal.proposed_rate}/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Durée estimée:</span>
              <span className="font-medium">{proposal.estimated_duration || "Non spécifiée"} heures</span>
            </div>
          </CardContent>
        </Card>

        {/* Contract Form */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du Contrat</CardTitle>
            <CardDescription>Configurez les termes du contrat et du paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="agreed_rate">Taux horaire convenu ($)</Label>
                <Input
                  id="agreed_rate"
                  type="number"
                  step="0.01"
                  value={formData.agreed_rate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, agreed_rate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">Date de fin (optionnelle)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="payment_amount">Montant du paiement initial ($)</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={formData.payment_amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, payment_amount: e.target.value }))}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Ce montant sera mis en escrow et libéré à la fin du projet</p>
              </div>

              <div>
                <Label htmlFor="payment_terms">Conditions de paiement</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, payment_terms: e.target.value }))}
                  placeholder="Décrivez les conditions de libération du paiement..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Création en cours..." : "Créer le Contrat et Mettre en Escrow"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
