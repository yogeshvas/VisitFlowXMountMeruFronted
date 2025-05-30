"use client"
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Search, ArrowLeft, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getUser, getUserAttendance, getUserProfile, getUserVisits } from '@/services/api';

// Define types for API responses
interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  total_visits?: number;
  manager?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Client {
  _id: string;
  company_name: string;
  address: string;
  contact_person: string;
  category: string;
  status: string;
}

interface Visit {
  _id: string;
  client: Client;
  check_in_time: string;
  comments: string;
  createdAt: string;
}

interface Attendance {
  _id: string;
  startDateTime: string;
  endDateTime?: string;
  startLocation: {
    lat: number;
    lng: number;
  };
  endLocation: {
    lat: number;
    lng: number;
  };
  kmTravelled: number;
  createdAt: string;
  updatedAt: string;
}

interface VisitsByDate {
  [date: string]: Visit[];
}

interface AttendanceByDate {
  [date: string]: Attendance[];
}

interface UserVisitsResponse {
  success: boolean;
  data: {
    user: User;
    visitsByDate: VisitsByDate;
  };
}

interface UserAttendanceResponse {
  success: boolean;
  data: {
    user: User;
    summary: {
      totalRecords: number;
      totalKmTravelled: number;
      daysLogged: number;
    };
    attendanceByDate: AttendanceByDate;
  };
}

interface UserProfileResponse {
  statusCode: number;
  data: string;
  message: User;
  success: boolean;
}

interface SearchUserResponse {
  _id: string;
  name: string;
  email: string;
}

const UserAnalytics: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchUserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Last day of current month
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [visits, setVisits] = useState<VisitsByDate>({});
  const [attendance, setAttendance] = useState<UserAttendanceResponse['data'] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

  // Function to navigate back (to be connected to your routing system)
  const handleGoBack = () => {
    // Implement your navigation logic here
    window.history.back();
  };

  // Search users - debounced
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    try {
      setSearchLoading(true);
      const data = await getUser(searchQuery);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Select user and fetch data
  const handleSelectUser = async (user: SearchUserResponse) => {
    setOpen(false);
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    await fetchUserData(user.email);
  };

  // Fetch all user data based on selected date range
  const fetchUserData = async (email: string) => {
    setLoading(true);
    const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
    const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

    try {
      // Fetch user profile, visits, and attendance data in parallel
      const [profileResponse, visitsResponse, attendanceResponse] = await Promise.all([
        getUserProfile(email, startDateStr, endDateStr),
        getUserVisits(email, startDateStr, endDateStr),
        getUserAttendance(email, startDateStr, endDateStr)
      ]);

      setUserProfile(profileResponse.message);
      setVisits(visitsResponse.data.visitsByDate);
      setAttendance(attendanceResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply date range and fetch data
  const handleApplyDateRange = () => {
    setOpenDatePicker(false);
    if (selectedUser) {
      fetchUserData(selectedUser.email);
    }
  };

  // Generate an array of all dates within the range for attendance
  const generateDateRangeArray = () => {
    const dates = [];
    let currentDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates.sort((a, b) => b.getTime() - a.getTime()); // Sort from newest to oldest
  };

  // Calculate total visits
  const totalVisits = Object.values(visits).reduce((total, dayVisits) => total + dayVisits.length, 0);

  // Get list of dates with visits
  const visitDates = Object.keys(visits).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort from newest to oldest
  
  // Get all dates in range for attendance
  const allDatesInRange = generateDateRangeArray();
  
  // Get map of attendance dates
  const attendanceDateMap = attendance?.attendanceByDate || {};

  // Helper for determining badge colors for client categories
  const getCategoryBadgeClass = (category: string) => {
    switch(category) {
      case 'HOT': return 'bg-red-500 hover:bg-red-600';
      case 'WARM': return 'bg-amber-500 hover:bg-amber-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-md md:max-w-lg bg-background min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleGoBack}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-xl font-bold">User Analytics</h1>
        <div className="w-10"></div> {/* Empty div for centering */}
      </div>
      
      {/* Search Input with animated loading */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Input
            placeholder="Search user by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {searchLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Search Results with improved styling */}
        {searchResults.length > 0 && (
          <Card className="w-full shadow-md">
            <CardContent className="p-2">
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div 
                    key={user._id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-10 w-10 mr-3 border">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Date Range Picker - Only show if user is selected */}
        {selectedUser && (
          <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-md" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(newRange) => {
                  if (newRange?.from && newRange?.to) {
                    setDateRange({ from: newRange.from, to: newRange.to });
                  }
                }}
                numberOfMonths={1}
                className="p-1"
              />
              <div className="p-3 border-t border-border">
                <Button
                  className="w-full"
                  onClick={handleApplyDateRange}
                >
                  Apply Date Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* No user selected message */}
      {!selectedUser && !loading && searchResults.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-10">
          <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <h2 className="text-lg font-medium text-muted-foreground">
            Search for users to view analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Enter a name or email to find users and view their profile, visits, and attendance data
          </p>
        </div>
      )}

      {/* Loading state - improved skeleton */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      )}

      {/* User data display */}
      {selectedUser && userProfile && !loading && (
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-xl p-1">
            <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
            <TabsTrigger value="visits" className="rounded-lg">
              Visits <Badge variant="outline" className="ml-1 bg-primary/10">{totalVisits}</Badge>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg">Attendance</TabsTrigger>
          </TabsList>

          {/* Profile Tab - Improved layout */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="p-5">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {userProfile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                    <CardDescription className="text-sm">{userProfile.email}</CardDescription>
                    <Badge variant="secondary" className="mt-2">
                      {userProfile.role || 'User'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-3 pt-0">
                <h3 className="text-md font-medium mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gray-50 border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Total Visits</p>
                      <p className="text-2xl font-bold text-primary">{totalVisits}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Distance</p>
                      <p className="text-2xl font-bold text-primary">
                        {attendance?.summary.totalKmTravelled.toFixed(1)} <span className="text-sm font-normal">km</span>
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Days Present</p>
                      <p className="text-2xl font-bold text-primary">{attendance?.summary.daysLogged || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Avg. Visits/Day</p>
                      <p className="text-2xl font-bold text-primary">
                        {attendance?.summary.daysLogged && attendance.summary.daysLogged > 0
                          ? (totalVisits / attendance.summary.daysLogged).toFixed(1) 
                          : '0'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              {userProfile.manager && (
                <CardFooter className="p-5 pt-0">
                  <div className="w-full pt-3 border-t mt-3">
                    <p className="text-xs text-muted-foreground mb-2 uppercase font-medium">Reports to</p>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userProfile.manager.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userProfile.manager.name}</p>
                        <p className="text-xs text-muted-foreground">{userProfile.manager.email}</p>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Visits Tab - Using Accordion */}
          <TabsContent value="visits" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Client Visits</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary">{totalVisits} visits</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-0 py-0">
                {visitDates.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {visitDates.map((date) => (
                      <AccordionItem key={date} value={date} className="border-b">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 group">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-base">
                                {format(new Date(date), "EEEE, MMM d")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {visits[date].length} {visits[date].length === 1 ? 'visit' : 'visits'}
                              </span>
                            </div>
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary group-hover:bg-primary/20">
                              {visits[date].length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <div className="space-y-3 pt-2">
                            {visits[date].map((visit) => (
                              <Card key={visit._id} className="border-l-4 shadow-sm" style={{ borderLeftColor: visit.client.category === 'HOT' ? '#ef4444' : visit.client.category === 'WARM' ? '#f59e0b' : '#3b82f6' }}>
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{visit.client.company_name}</CardTitle>
                                    <Badge className={cn(
                                      "text-xs",
                                      getCategoryBadgeClass(visit.client.category)
                                    )}>
                                      {visit.client.category}
                                    </Badge>
                                  </div>
                                  <CardDescription className="text-xs flex items-center mt-1">
                                    <span className="font-medium">{format(new Date(visit.check_in_time), "h:mm a")}</span>
                                    <span className="mx-2">•</span>
                                    <span>{visit.client.contact_person}</span>
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  <p className="text-xs text-muted-foreground mb-2">{visit.client.address}</p>
                                  {visit.comments && (
                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                      <p className="text-sm">{visit.comments}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 px-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">No visits recorded in the selected date range.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try selecting a different date range.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab - Improved UI */}
          <TabsContent value="attendance" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Attendance Records</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    {attendance?.summary.daysLogged || 0} days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allDatesInRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSunday = date.getDay() === 0; // 0 represents Sunday
                    const isPresent = dateStr in attendanceDateMap;
                    const kmTravelled = isPresent ? attendanceDateMap[dateStr][0].kmTravelled.toFixed(1) : '0';
                    
                    return (
                      <div key={dateStr} className={cn(
                        "flex items-center justify-between p-4",
                        isPresent && "bg-green-50",
                        isSunday && !isPresent && "bg-blue-50",
                        !isPresent && !isSunday && "bg-red-50/30"
                      )}>
                        <div>
                          <div className="flex items-center">
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-2",
                              isPresent ? "bg-green-500" : isSunday ? "bg-blue-500" : "bg-red-500"
                            )}></div>
                            <p className="font-medium">{format(date, "EEEE, MMM d")}</p>
                          </div>
                          <div className="ml-4 mt-1">
                            <Badge 
                              variant={isPresent ? "default" : "outline"} 
                              className={cn(
                                "text-xs",
                                isPresent ? "bg-green-500 hover:bg-green-600" : 
                                isSunday ? "bg-blue-500 hover:bg-blue-600" : "border-red-300 text-red-500"
                              )}
                            >
                              {isPresent ? "Present" : isSunday ? "Weekend Off" : "Absent"}
                            </Badge>
                          </div>
                        </div>
                        {isPresent && (
                          <div className="text-right bg-white py-1 px-3 rounded-md border border-green-100 shadow-sm">
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="font-medium text-green-600">{kmTravelled} km</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {allDatesInRange.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">No data for the selected date range.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try selecting a different date range.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-5 border-t">
                <div className="grid grid-cols-2 gap-4 w-full text-sm">
                  <Card className="bg-green-50 border border-green-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Days Present</p>
                      <p className="text-2xl font-bold text-green-600">{attendance?.summary.daysLogged || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border border-green-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <p className="text-xs text-muted-foreground uppercase font-medium">Total Distance</p>
                      <p className="text-2xl font-bold text-green-600">
                        {attendance?.summary.totalKmTravelled.toFixed(1)} <span className="text-sm font-normal">km</span>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UserAnalytics;