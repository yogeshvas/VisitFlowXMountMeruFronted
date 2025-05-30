"use client"
import React from 'react'
import { Home, User, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'

const BottomTabs = () => {
  const router = useRouter()
  const pathname = usePathname()
  
  // Determine active tab based on current pathname rather than state
  const getActiveTab = (path: string) => {
    if (path === '/') return 'Dashboard'
    if (path === '/client') return 'Client'
    if (path === '/more') return 'More'
    return 'Dashboard' // Default
  }
  
  const activeTab = getActiveTab(pathname)

  const tabs = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'Client', icon: User, label: 'Client', path: '/client' },
    { id: 'More', icon: MoreHorizontal, label: 'More', path: '/more' },
  ]

  // Check if current path is one of the routes where tabs should be visible
  const shouldShowTabs = ['/', '/client', '/more'].includes(pathname)

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  if (!shouldShowTabs) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-800 h-16 z-50">
      <div className="max-w-md mx-auto h-full flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
              )}
              onClick={() => handleTabClick(tab.path)}
            >
              {isActive && (
                <span className="absolute top-0 block w-12 h-1 rounded-full bg-primary" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 mb-1 transition-transform",
                isActive ? "scale-110" : ""
              )} />
              
              <span className={cn(
                "text-xs font-medium",
                isActive ? "font-semibold" : ""
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomTabs