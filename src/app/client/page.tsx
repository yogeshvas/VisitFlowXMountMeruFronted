"use client"
import React, { useState } from 'react'
import { Users, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import NearbyClients from '@/components/custom/client/NearbyClients'
import AllClients from '@/components/custom/client/AllClients'

const Client = () => {
  const [activeTab, setActiveTab] = useState('nearby')
//   const navigate = useNavigate()
    const router = useRouter()
  const handleAddClient = () => {
    router.push('/client/add-client')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client</h1>
        <Button onClick={handleAddClient} className="flex items-center gap-2">
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      <div className="flex mb-4 border-b">
      <button
          onClick={() => setActiveTab('nearby')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === 'nearby' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <MapPin size={16} />
          Clients Near Me
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === 'all' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <Users size={16} />
          All Clients
        </button>
       
      </div>

      <Card className="p-4">
        {activeTab === 'all' ? (
          <div><AllClients /></div>
        ) : (
          <div><NearbyClients /></div>
        )}
      </Card>
    </div>
  )
}

export default Client