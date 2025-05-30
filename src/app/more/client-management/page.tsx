"use client"
import React, { useEffect, useState } from 'react';
import { ChevronLeft, UserPlus, BarChart2, Calendar, Target, Search, User, ArrowLeft, SquareCheckBig, ChartArea, UserRoundSearch, Dock, Book, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const ClientManagement = () => {
      const [userData, setUserData] = useState({ name: '', email: '', role: '' })
        
      useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || '{}')
        setUserData(user)
      }, [])
    const router = useRouter();
    const handleNavigate = (route:string)=>  {
        router.push(route);
    }
  return (
    <div className="flex flex-col max-w-xl mx-auto">
      {/* Header */}
      <div className=" text-black p-4 flex items-center border-b">
        <Button variant="ghost" size="icon" className="text-white mr-2" onClick={() => router.back()}>
          <ArrowLeft color='#000'/>
        </Button>
        <h1 className="text-lg font-medium">Client Management</h1>
       
      </div>


     
      {/* Menu Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 bg-white">
           <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/more/client-management/add-client-documents')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <UserPlus className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">Add Clients Documents</span>
          </CardContent>
        </Card>
         <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/more/client-management/my-onboarded-clients')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ArrowDownRight className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black text-center">My Onboarded Clients </span>
          </CardContent>
        </Card>
    
       { userData.role === 'admin' && <>   <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/more/client-management/see-onboarded-clients')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Book className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black text-center">See Client Documents </span>
          </CardContent>
        </Card>

      </>}
        
        {/* <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/user-management/user-analytics')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <BarChart2 className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">User Analytics</span>
          </CardContent>
        </Card> */}

        {/* <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/user-management/user-performance')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">Start of the Month</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/user-management/assign-task')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <SquareCheckBig className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">Assign Task</span>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/user-management/user-analytics')}>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <UserRoundSearch className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">User Analytics</span>
          </CardContent>
        </Card> */}



        {/* <Card className="border-gray-200 hover:border-black" onClick={()=>handleNavigate('/user-management/target-achievement')}> 
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-black">Target Vs Achievement</span>
          </CardContent>
        </Card> */}
      </div>


    
    </div>
  );
};

export default ClientManagement;