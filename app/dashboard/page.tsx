import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"
import { FreelancerDashboard } from "@/components/dashboard/freelancer-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      {profile.role === "client" ? (
        <ClientDashboard profile={profile} />
      ) : profile.role === "freelancer" ? (
        <FreelancerDashboard profile={profile} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Coming Soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
