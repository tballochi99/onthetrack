"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cardimprove"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import CompositionForm from '../../components/CompositionForm';
import VideoUploadForm from '../../components/VideoUploadForm';
import { Composition } from '../../../../types/composition';

export default function AddATrack() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [compositions, setCompositions] = useState<Composition[]>([])
  const [licenses, setLicenses] = useState([])
  const [showUploadForm, setShowUploadForm] = useState(false)

  const fetchUserCompositions = async () => {
    try {
      const response = await fetch('/api/compositions/user')
      const data = await response.json()
      if (data.success) {
        setCompositions(data.data)
      }
    } catch (error) {
      console.error('Error fetching user compositions:', error)
    }
  }

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/licenses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setLicenses(data)
    } catch (error) {
      console.error('Error fetching licenses:', error)
    }
  }

  useEffect(() => {
    if (session && session.user) {
      fetchUserCompositions()
      fetchLicenses()
    }
  }, [session])

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">You must be logged in to view this page.</p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCompositionSubmit = async () => {
    await fetchUserCompositions()
  }

  return (
    <div className="bg-[#111827] text-[#FFFFFF] min-h-screen flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-4xl bg-[#1F2937] border-[#374151]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-[#F3F4F6]">Add a Track</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CompositionForm licenses={licenses} onCompositionCreated={handleCompositionSubmit} />

          <div className="flex items-center space-x-2">
            <Switch
              id="video-upload"
              checked={showUploadForm}
              onCheckedChange={setShowUploadForm}
            />
            <Label htmlFor="video-upload" className="text-[#D1D5DB]">
              {showUploadForm ? 'Video Upload Enabled' : 'Enable Video Upload'}
            </Label>
          </div>

          {showUploadForm && (
            <div className="mt-6">
              <VideoUploadForm />
            </div>
          )}

          <Button
            asChild
            variant="outline"
            className="w-full mt-6"
          >
            <Link href="/profile">Go back to Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}




