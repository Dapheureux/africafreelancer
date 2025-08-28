"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Phone, Mail, Star, Briefcase, Calendar } from "lucide-react"
import Link from "next/link"
import type { Profile, Project, Review } from "@/lib/types"

export default function ProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    averageRating: 0,
    totalReviews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [params.id])

  const fetchProfileData = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(currentProfile)
    }

    // Get profile data
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", params.id).single()

    if (profileData) {
      setProfile(profileData)

      // Get projects based on role
      if (profileData.role === "client") {
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", profileData.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5)

        if (projectsData) setProjects(projectsData)
      }

      // Get reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, reviewer:profiles!reviews_reviewer_id_fkey(*)")
        .eq("reviewee_id", profileData.id)
        .order("created_at", { ascending: false })

      if (reviewsData) {
        setReviews(reviewsData)
        const avgRating =
          reviewsData.length > 0 ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length : 0
        setStats({
          totalProjects: projects.length,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviewsData.length,
        })
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={currentUser || undefined} />
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={currentUser || undefined} />
        <div className="flex items-center justify-center min-h-screen">Profile not found</div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={currentUser || undefined} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name} />
                  <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                <CardDescription className="capitalize">
                  <Badge variant={profile.role === "client" ? "default" : "secondary"}>{profile.role}</Badge>
                </CardDescription>
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline" className="mt-4 bg-transparent">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                {profile.role === "freelancer" && (
                  <>
                    {profile.hourly_rate && (
                      <div>
                        <h4 className="font-semibold mb-2">Hourly Rate</h4>
                        <p className="text-green-600 font-medium">${profile.hourly_rate}/hour</p>
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <span className="font-medium">{stats.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{stats.averageRating}</span>
                    <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <span className="font-medium">{stats.totalReviews}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Projects (for clients) */}
            {profile.role === "client" && projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest completed projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{project.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Budget: ${project.budget_min} - ${project.budget_max}
                          </span>
                          <span>Completed: {new Date(project.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
                <CardDescription>What others say about working with {profile.full_name}</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.reviewer?.avatar_url || ""} alt={review.reviewer?.full_name} />
                              <AvatarFallback>{getInitials(review.reviewer?.full_name || "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.reviewer?.full_name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-700">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
