"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, User, Building2, Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { get_client_by_id, getUserForReview } from '@/services/api'
import { addReview } from '@/services/reviews-api'

interface ClientData {
  _id: string
  company_name: string
  address: string
  contact_person: string
  contact_email: string
  contact_phone: string
  category: string
  status: string
  best_for: string[]
}

interface UserData {
  name: string
  email: string
}

// Child component that uses useSearchParams
const RatingContent = () => {
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')
  const clientId = searchParams.get('client')

  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !clientId) {
        toast.error("User ID and Client ID are required")
        return
      }

      try {
        setLoading(true)
        const [clientResponse, userResponse] = await Promise.all([
          get_client_by_id(clientId),
          getUserForReview(userId)
        ])
        console.log("Client Response:", clientResponse)
        console.log("User Response:", userResponse)
        setClientData(clientResponse.data)
        setUserData(userResponse.data)
      } catch (error) {
        toast.error("Failed to fetch data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, clientId])

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error("Please select a rating")
      return
    }

    if (!review.trim()) {
      toast.error("Please write a review")
      return
    }

    try {
      setSubmitting(true)
      await addReview(clientId!, userId!, review, rating.toString())
      toast.success("Review submitted successfully!")
      setSubmitted(true)
    } catch (error) {
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = () => (
    <div className="flex gap-1 justify-center py-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1 rounded-full hover:bg-muted transition-colors"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )

  const SuccessView = () => (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-md mx-auto flex items-center justify-center min-h-[80vh]">
        <Card className="w-full">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle 
                    className="w-20 h-20 text-green-500 animate-pulse" 
                    strokeWidth={1.5}
                  />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-green-600">
                  Review Submitted Successfully!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Thank you for your feedback
                </p>
                <p className="text-sm text-muted-foreground">
                  Your review has been submitted.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-center items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold">{rating}/5 stars</span>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{review}"
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Thanks for taking the time to share your experience with us!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!clientData || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Data Not Found</h2>
            <p className="text-muted-foreground">Unable to load client or user information.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return <SuccessView />
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Rate Your Experience</h1>
          <p className="text-muted-foreground mt-1">Share your feedback</p>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{clientData.company_name}</h3>
              <p className="text-sm text-muted-foreground">{clientData.contact_person}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="break-all">{clientData.contact_email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{clientData.contact_phone}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-xs">{clientData.address}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">{clientData.category}</Badge>
              <Badge variant="outline">{clientData.status}</Badge>
            </div>
            {clientData.best_for && clientData.best_for.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {clientData.best_for.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg

">
              <User className="w-5 h-5" />
              Sales Representative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{userData.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {userData.email}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Your Rating</CardTitle>
            <CardDescription>
              Rate your experience with {userData.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-center block mb-2">
                Rating: {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </Label>
              <StarRating />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                id="review"
                placeholder="Share your experience and feedback..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            <Button 
              onClick={handleSubmitReview}
              disabled={submitting || !rating || !review.trim()}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
const RatingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <RatingContent />
    </Suspense>
  )
}

export default RatingPage