"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Payment, Transaction, Contract } from "@/lib/types"

interface PaymentWithDetails extends Payment {
  contract: Contract & {
    project: { title: string; description: string }
    client: { full_name: string; email: string }
    freelancer: { full_name: string; email: string }
  }
}

interface TransactionWithPayment extends Transaction {
  payment: Payment
}

export default function PaymentDetailsPage() {
  const params = useParams()
  const [payment, setPayment] = useState<PaymentWithDetails | null>(null)
  const [transactions, setTransactions] = useState<TransactionWithPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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

      // Fetch payment details
      const { data: paymentData } = await supabase
        .from("payments")
        .select(`
          *,
          contract:contracts(
            *,
            project:projects(title, description),
            client:profiles!contracts_client_id_fkey(full_name, email),
            freelancer:profiles!contracts_freelancer_id_fkey(full_name, email)
          )
        `)
        .eq("id", params.id)
        .single()

      setPayment(paymentData)

      // Fetch transaction history
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select(`
          *,
          payment:payments(*)
        `)
        .eq("payment_id", params.id)
        .order("created_at", { ascending: false })

      setTransactions(transactionsData || [])
      setLoading(false)
    }

    fetchData()
  }, [params.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "escrowed":
        return <DollarSign className="h-5 w-5" />
      case "released":
        return <CheckCircle className="h-5 w-5" />
      case "refunded":
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
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

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Paiement non trouvé</h1>
          <Button asChild className="mt-4">
            <Link href="/payments">Retour aux paiements</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isClient = user?.id === payment.contract.client_id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/payments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux paiements
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Détails du Paiement</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(payment.status)}
              Informations du Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant:</span>
              <span className="text-2xl font-bold text-green-600">${payment.amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Statut:</span>
              <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                {getStatusIcon(payment.status)}
                {payment.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Créé le:</span>
              <span>{new Date(payment.created_at).toLocaleDateString()}</span>
            </div>
            {payment.escrow_date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mis en escrow le:</span>
                <span>{new Date(payment.escrow_date).toLocaleDateString()}</span>
              </div>
            )}
            {payment.release_date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Libéré le:</span>
                <span>{new Date(payment.release_date).toLocaleDateString()}</span>
              </div>
            )}
            {payment.refund_date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remboursé le:</span>
                <span>{new Date(payment.refund_date).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Contrat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{payment.contract.project.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{payment.contract.project.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Client:</span>
              <span className="font-medium">{payment.contract.client.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-medium">{payment.contract.freelancer.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux convenu:</span>
              <span className="font-medium">${payment.contract.agreed_rate}/h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
          <CardDescription>Toutes les actions effectuées sur ce paiement</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune transaction pour le moment</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{transaction.type}</div>
                    <div className="text-sm text-gray-600">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${transaction.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
