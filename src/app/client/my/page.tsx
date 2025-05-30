"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ChevronLeft, Search, Phone, Mail, Users, Truck, Calendar } from 'lucide-react'
import { get_my_client } from '@/services/api'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Type definitions for client data
interface FollowUpDate {
  date: string
  user: string
  _id: string
}

interface Client {
  _id: string
  company_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  category: string
  status: string
  fleet_size?: string
  best_for: string[]
  no_of_employees: number
  comment?: string
  follow_up_dates: FollowUpDate[]
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalClients: number
}

const MyClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalClients: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [searchTerm, clients, activeTab])

  const filterClients = () => {
    let filtered = clients

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(client =>
        client?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(client => client.category === activeTab.toUpperCase())
    }

    setFilteredClients(filtered)
  }

  const fetchClients = async (page = 1) => {
    try {
      setLoading(true)
      const response = await get_my_client()
      setClients(response.data.clients)
      setFilteredClients(response.data.clients)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchClients(page)
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'HOT': return 'destructive'
      case 'WARM': return 'outline'
      case 'COLD': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default'
      case 'Follow-Up-Met': return 'default'
      case 'Follow-Up-Not-Met': return 'destructive'
      case 'Proposal Sent': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const viewClient = (clientId: string) => {
    router.push(`/client/${clientId}`)
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={goBack} className="hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Clients</h1>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by company, contact person or email..."
          className="pl-10 bg-slate-50 border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="hot">Hot</TabsTrigger>
          <TabsTrigger value="warm">Warm</TabsTrigger>
          <TabsTrigger value="cold">Cold</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Client summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        {!loading && (
          <p>Showing {filteredClients.length} of {clients.length} clients</p>
        )}
      </div>

      {/* Client cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client?._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{client?.company_name}</h3>
                  <Badge variant={getCategoryBadgeVariant(client?.category)} className="ml-2">
                    {client?.category}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{client?.contact_person}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{client?.contact_email}</span>
                  </div>
                  
                  {client?.contact_phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{client?.contact_phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={getStatusBadgeVariant(client?.status)}>
                    {client?.status.replace(/-/g, ' ')}
                  </Badge>
                  
                  {client?.follow_up_dates.length > 0 && (
                    <div className="flex items-center text-sm bg-slate-100 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Follow up: {formatDate(client?.follow_up_dates[0].date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    <span>Fleet: {client?.fleet_size || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Employees: {client?.no_of_employees}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => viewClient(client?._id)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">
              {searchTerm ? 'No clients match your search' : 'No clients found'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {pagination.currentPage > 1 && (
                  <PaginationPrevious onClick={() => handlePageChange(pagination.currentPage - 1)} />
                )}
              </PaginationItem>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.currentPage - 2 + i
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === pagination.currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                {pagination.currentPage < pagination.totalPages && (
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default MyClients