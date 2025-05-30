"use client"
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isToday, isTomorrow } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CalendarIcon, MapPin, Clock, PhoneCall } from 'lucide-react';
import { getMyTasks, changeTaskStatus } from '@/services/api';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';

// Define interfaces for the data structures
interface Client {
  _id: string;
  company_name: string;
  address: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

interface Task {
  _id: string;
  user: string;
  type: string;
  client: Client;
  description: string;
  date: string;
  time: string;
  status: string;
  product: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CustomDateRange {
  from: Date;
  to: Date;
}

const MyTasks = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateRange, setDateRange] = useState<CustomDateRange>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTasks = async (start: Date, end: Date) => {
    setIsLoading(true);
    try {
      const response = await getMyTasks(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      setTasks(response);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(dateRange.from, dateRange.to);
  }, [dateRange]);

  const groupTasksByDate = (): { [key: string]: Task[] } => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      const taskDate = new Date(task.date);
      let key: string;
      if (isToday(taskDate)) {
        key = 'Today';
      } else if (isTomorrow(taskDate)) {
        key = 'Tomorrow';
      } else {
        key = format(taskDate, 'EEEE, MMMM d');
      }
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });
    return grouped;
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus.toLowerCase() === 'pending' ? 'completed' : 'pending';
    try {
      await changeTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
     toast.success(
        `Task status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`
      );
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCallClient = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  const groupedTasks = groupTasksByDate();

  return (
    <div className="flex flex-col max-w-xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">My Tasks</h1>
        <div className="w-8"></div>
      </div>

      {/* Date Range Selector */}
      <div className="px-4 py-3 bg-white border-b">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex justify-between items-center border-gray-200 bg-white hover:bg-gray-50"
            >
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}</span>
              </div>
              <span className="text-xs text-gray-500">{tasks.length} tasks</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range: import('react-day-picker').DateRange | undefined) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={1}
              className="bg-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tasks Content */}
      <div className="flex-1 p-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-700 mb-1">No tasks scheduled</h3>
            <p className="text-sm text-gray-500">Try selecting a different date range</p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <div key={date}>
              <div className="flex items-center mb-3">
                <h2 className="text-lg font-medium text-gray-800">{date}</h2>
                <Badge variant="outline" className="ml-2 text-xs">
                  {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                </Badge>
              </div>
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <div 
                    key={task._id} 
                    className="bg-white border border-gray-100 rounded-lg p-4 flex items-start space-x-3"
                  >
                    <Checkbox
                      checked={task.status.toLowerCase() === 'completed'}
                      onCheckedChange={() => handleToggleStatus(task._id, task.status)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold text-gray-800">
                          {task.client.company_name}
                        </h3>
                        <Badge className={getStatusBadgeColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-2">
                        <Badge variant="outline">{task.product}</Badge>
                        <Badge variant="secondary" className="text-xs">{task.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {task.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {task.client.address.split(',')[0]}
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {task.client.contact_person.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.client.contact_person}</p>
                          <p className="text-xs text-gray-500">{task.client.contact_phone}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallClient(task.client.contact_phone)}
                        >
                          <PhoneCall className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleViewClient(task.client._id)}
                        >
                          View Client
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;