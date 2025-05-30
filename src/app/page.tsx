"use client"
import { get_dashboard_data } from '@/services/api'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { 
  User, 
  Briefcase, 
  Calendar, 
  Plus, 
  Activity, 
  Clock, 
  Flame, 
  CheckCircle, 
  ChevronRight,
  Users,
  ClipboardList,
  MapPin,
  ArrowUp,
  Mail,
  Phone,
  CalendarDays
} from 'lucide-react'
import { DashboardData } from '@/types'
import { useRouter } from 'next/navigation'
import StarOfTheMonth from '@/components/custom/client/dashboard/Star'

const Home = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const handleAddVisit = (clientId:string)=> {
    router.push(`/client/${clientId}`)
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get_dashboard_data()
        setData(response)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-700">Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  // Safely prepare chart data
  const chartData = Object.entries(data.visitsThisWeek || {}).map(([date, count]) => {
    // Ensure count is a number
    const visitCount = typeof count === 'number' ? count : 0
    
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      visits: visitCount,
      // Add a random growth percentage for visual appeal
      growth: Math.floor(Math.random() * 30) - 10
    }
  })

  // Get top clients safely
  const topClients = (data.my_top_clients || []).slice(0, 3)
  
  // Safely count active clients
  const activeClientsCount = data.stats && data.stats.hotClients && Array.isArray(data.stats.hotClients.list) 
    ? data.stats.hotClients.list.filter(c => c.status === 'Active').length 
    : 0
const handleCall = (phone:any) => {
  window.location.href = `tel:${phone}`
}

  return (
    <div className="min-h-screen
">
      {/* Header with background */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 pb-16">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center space-x-3">
            <Image 
              src="/white-logo.png" 
              alt="VisitFlow Logo" 
              width={48} 
              height={48} 
              className="" 
            />
            <h1 className="text-2xl font-bold">VisitFlow</h1>
          </div>
          <div className="flex items-center space-x-4" >
            <div className="flex items-center space-x-2 bg-blue-400/30  p-3 rounded-full" onClick={() => router.push("/my-tasks")}>
              <CalendarDays className="h-4 w-4" />
  
            </div>
            <Avatar 
              className="h-10 w-10 border-2 border-white cursor-pointer transition-transform hover:scale-105" 
              onClick={() => { router.push("/profile")}}
            >
              <AvatarImage src="" />
              <AvatarFallback className="bg-white text-blue-600 font-medium">
                {data.user && data.user.name ? data.user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="px-4 py-0 max-w-5xl mx-auto">
        {/* Welcome Card */}
        <Card className="mb-6 -mt-12 border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-white pb-2">
            <CardTitle className="text-xl flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Welcome back, {data.user && data.user.name ? data.user.name : 'User'}!
            </CardTitle>
            <p className="text-sm text-gray-500 ml-7">Here's your dashboard overview</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 transition-all hover:bg-blue-100">
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <Activity className="h-4 w-4 mr-1 text-blue-500" />
                  Total Visits
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.user && data.user.total_visits ? data.user.total_visits : 0}
                </p>
                
              </div>
              <div className="bg-purple-50 rounded-lg p-4 transition-all hover:bg-purple-100">
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <Users className="h-4 w-4 mr-1 text-purple-500" />
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.stats && data.stats.totalClients ? data.stats.totalClients : 0}
                </p>
                
              </div>
              <div className="bg-orange-50 rounded-lg p-4 transition-all hover:bg-orange-100">
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <Flame className="h-4 w-4 mr-1 text-orange-500" />
                  Hot Clients
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.stats && data.stats.hotClients ? data.stats.hotClients.count : 0}
                </p>
                <div className="flex items-center mt-1 text-blue-600 text-xs">
                  <span>Requires attention</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 transition-all hover:bg-green-100">
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  NPS Score
                </p>
                <p className="text-2xl font-bold text-gray-800">{data.user.avg_rating}</p>
                <div className="flex items-center mt-1 text-gray-500 text-xs">
                {data.user.avg_rating >= 4 ? (
                  <span className="text-green-600">Great! Keep it up!</span>
                ) : data.user.avg_rating >= 3 ? (
                  <span className="text-yellow-800">Good, but there's room for improvement</span>
                ) : (
                  <span className="text-red-600">Needs attention</span>
                )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      <div className="container mb-5">
        <StarOfTheMonth />
      </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Weekly Visits Chart */}
            <Card className="shadow rounded-xl overflow-hidden border-0 max-w-full">
              <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
                  Visits This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px', 
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow rounded-xl overflow-hidden border-0">
              <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {data.user && data.user.visits && data.user.visits.slice(0, 3).map((visit:any, index) => (
                    <div key={visit._id || index} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-3 rounded-full mr-4 ${
                        index % 3 === 0 ? 'bg-blue-100 text-blue-600' :
                        index % 3 === 1 ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          Visit recorded for {typeof visit.client_name === 'string' ? visit.client_name : 'Client'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(visit.check_in_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                        Details
                      </Button>
                    </div>
                  ))}
                  
                  {(!data.user || !data.user.visits || data.user.visits.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                      <Activity className="h-10 w-10 text-gray-300 mb-2" />
                      <p>No recent activities to display</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-4 w-4 mr-1" /> 
                        Record New Visit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Top Clients */}
            <Card className="shadow rounded-xl overflow-hidden border-0">
              <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  Top Clients
                </CardTitle>
                <Link href="/client/my">
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {topClients && topClients.length > 0 ? (
                    topClients.map((client:any, index) => (
                      <div key={client._id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-12 w-12 mr-3 border">
                            <AvatarFallback className={`${
                              index % 3 === 0 ? 'bg-blue-100 text-blue-600' :
                              index % 3 === 1 ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {typeof client.company_name === 'string' ? client.company_name.charAt(0).toUpperCase() : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {typeof client.company_name === 'string' ? client.company_name : 'Company'}
                            </p>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                             {typeof client.address === 'string' ? client.address.slice(0, 10) : 'Address'}...
                            </p>
                          </div>
                          <div className="ml-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              client.status === 'Active' ? 'bg-green-100 text-green-800' :
                              client.status === 'Closed' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {typeof client.status === 'string' ? client.status : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Contact: {typeof client.contact_person === 'string' ? client.contact_person : 'Unknown'}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={()=> {handleCall(client.phone_number)}}>
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full ml-auto" onClick={() => handleAddVisit(client._id)}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Visit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                      <Briefcase className="h-10 w-10 text-gray-300 mb-2" />
                      <p>No clients to display</p>
                      <Link href="/client/add-client">
                        <Button variant="outline" size="sm" className="mt-4">
                          <Plus className="h-4 w-4 mr-1" /> 
                          Add New Client
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow rounded-xl overflow-hidden border-0">
              <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3">
              <Link href="/client/new-client">
                  <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 shadow-md">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Client
                  </Button>
                </Link>
                <Link href="/client">
                  <Button className="w-full h-12 bg-green-500 hover:bg-green-600 shadow-md">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Visit
                  </Button>
                </Link>
                <Link href="/more/reports">
                  <Button className="w-full h-12 bg-purple-500 hover:bg-purple-600 shadow-md">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Generate Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home