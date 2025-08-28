"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import type { Payment, Contract } from "@/lib/types"
import type { User } from "@supabase/supabase-js"


interface PaymentWithContract extends Payment {
  contract: Contract & {
    project: { title: string }
    client: { full_name: string }
    freelancer: { full_name: string }
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "escrowed":
      return <DollarSign className="h-4 w-4" />
    case "released":
      return <CheckCircle className="h-4 w-4" />
    case "refunded":
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "escrowed":
      return "bg-blue-100 text-blue-800"
    case "released":
      return "bg-green-100 text-green-800"
    case "refunded":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithContract[]>([])
  const [loading, setLoading] = useState(true)
  // const [user, setUser] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          contract:contracts(
            *,
            project:projects(title),
            client:profiles!contracts_client_id_fkey(full_name),
            freelancer:profiles!contracts_freelancer_id_fkey(full_name)
          )
        `)
        .order("created_at", { ascending: false })

      setPayments(paymentsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const filterPayments = (status?: string) => {
    if (!status) return payments
    return payments.filter((payment) => payment.status === status)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
        <p className="text-gray-600 mt-2">Gérez vos paiements et transactions en toute sécurité</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="escrowed">En escrow</TabsTrigger>
          <TabsTrigger value="released">Libérés</TabsTrigger>
          <TabsTrigger value="refunded">Remboursés</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterPayments().map((payment) => (
            <PaymentCard key={payment.id} payment={payment} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterPayments("pending").map((payment) => (
            <PaymentCard key={payment.id} payment={payment} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="escrowed" className="space-y-4">
          {filterPayments("escrowed").map((payment) => (
            <PaymentCard key={payment.id} payment={payment} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="released" className="space-y-4">
          {filterPayments("released").map((payment) => (
            <PaymentCard key={payment.id} payment={payment} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="refunded" className="space-y-4">
          {filterPayments("refunded").map((payment) => (
            <PaymentCard key={payment.id} payment={payment} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PaymentCard({ payment, user }: { payment: PaymentWithContract; user: User | null }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const isClient = user?.id === payment.contract.client_id
  const canRelease = isClient && payment.status === "escrowed"
  const canRefund = isClient && payment.status === "escrowed"

  const handleRelease = async () => {
    await supabase
      .from("payments")
      .update({
        status: "released",
        release_date: new Date().toISOString(),
      })
      .eq("id", payment.id)

    // Create transaction record
    await supabase.from("transactions").insert({
      payment_id: payment.id,
      type: "release",
      amount: payment.amount,
      description: "Paiement libéré par le client",
    })

    window.location.reload()
  }

  const handleRefund = async () => {
    await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_date: new Date().toISOString(),
      })
      .eq("id", payment.id)

    // Create transaction record
    await supabase.from("transactions").insert({
      payment_id: payment.id,
      type: "refund",
      amount: payment.amount,
      description: "Paiement remboursé par le client",
    })

    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{payment.contract.project.title}</CardTitle>
            <CardDescription>
              {isClient
                ? `Freelancer: ${payment.contract.freelancer.full_name}`
                : `Client: ${payment.contract.client.full_name}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">${payment.amount}</div>
            <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
              {getStatusIcon(payment.status)}
              {payment.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Créé le {new Date(payment.created_at).toLocaleDateString()}</div>
          <div className="flex gap-2">
            {canRelease && (
              <Button onClick={handleRelease} size="sm" className="bg-green-600 hover:bg-green-700">
                Libérer le paiement
              </Button>
            )}
            {canRefund && (
              <Button onClick={handleRefund} variant="outline" size="sm">
                Rembourser
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/payments/${payment.id}`}>Voir détails</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
