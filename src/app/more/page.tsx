"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/services/api'
import { 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  UsersRound, 
  Upload, 
  Settings,
  ChevronRight,
  FolderKanban,
  Sparkles
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const ProfilePage = () => {
  const [userData, setUserData] = useState({ name: '', email: '', role: '' })
    
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || '{}')
    setUserData(user)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem("refreshToken")
      Cookies.remove('refreshToken')
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleNavigation = (path:any) => {
    window.location.href = path
  }
    
  // Define the navigation menu items
  const menuItems = [
    {
      title: "My Clients",
      icon: <Users className="h-5 w-5" />,
      path: "/client/my",
      showAlways: true
    },
    {
      title: "Attendance",
      icon: <Calendar className="h-5 w-5" />,
      path: "/more/attendance",
      showAlways: true
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      path: "/more/reports",
      showAlways: true
    }, {
      title: "My Reviews",
      icon: <Sparkles className="h-5 w-5" />,
      path: "/more/my-reviews",
      showAlways: true
    },{
      title: "Client Management",
      icon: <FolderKanban className="h-5 w-5" />,
      path: "/more/client-management",
      showAlways: true
      
    },
    {
      title: "User Management",
      icon: <UsersRound className="h-5 w-5" />,
      path: "/user-management",
      showIf: ["admin", "manager"]
      
    },
    
  ]
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with profile info */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={userData.name} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {userData.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{userData.name || 'User'}</h2>
            <p className="text-muted-foreground text-sm">{userData.email || 'email@example.com'}</p>
            <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
              {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Main content with grid layout */}
      <div className="flex-1 p-4 md:p-6">
        <h3 className="text-lg font-medium mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {menuItems.map((item, index) => (
            (item.showAlways || (item.showIf && item.showIf.includes(userData.role))) && (
              <Card 
                key={index}
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleNavigation(item.path)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                </CardContent>
              </Card>
            )
          ))}
        </div>
        
        {/* Account section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Account</h3>
          <Card>
            <CardContent className="px-2">
              {/* <Button 
                variant="ghost" 
                className="w-full justify-between h-14 px-4 rounded-none border-b"
                onClick={() => handleNavigation('/profile/settings')}
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button> */}
              
              <Button 
                variant="ghost" 
                className="w-full justify-between h-14 px-4 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Logout</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage