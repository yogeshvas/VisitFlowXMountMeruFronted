"use client";
import React, { useState } from 'react';
import { Search, Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { assignTask, getUser, search_client } from '@/services/api';

// Define types
type User = {
  _id: string;
  name: string;
  email: string;
};

type Client = {
  _id: string;
  company_name: string;
  address: string;
  contact_person: string;
  category?: string;
};

type FormData = {
  userId: string;
  userName: string;
  clientId: string;
  clientName: string;
  type: string;
  task: string;
  description: string;
  product: string;
};

const AssignTask: React.FC = () => {
  // States
  const [userQuery, setUserQuery] = useState<string>('');
  const [clientQuery, setClientQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Hardcoded product list
  const productOptions = [ 'Cashless', 'ERP', 'Etoll', 'BorderClearence', 
    'Parking', 'GPS Tracking', 'Cashless Money', "Other"];

  // Form data
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    userName: '',
    clientId: '',
    clientName: '',
    type: 'operation',
    task: '',
    description: '',
    product: '',
  });

  // Search functions with buttons
  const searchUsers = async (): Promise<void> => {
    if (!userQuery.trim()) return;
    try {
      const data = await getUser(userQuery);
      setUsers(data);
    } catch (error) {
      toast.error("Error fetching users. Please try again later.");
    }
  };

  const searchClients = async (): Promise<void> => {
    if (!clientQuery.trim()) return;
    try {
      const response = await search_client(clientQuery);
      setClients(response.data);
    } catch (error) {
      toast.error("Error fetching clients. Please try again later.");
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validation
    if (!formData.userId || !formData.clientId || !formData.task || !formData.type) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format date and time for API
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Call real API
      await assignTask(
        formData.userId,
        formData.type,
        formData.clientId,
        formData.task,
        formData.description,
        dateStr,
        selectedTime,
        formData.product
      );
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      toast.success(`Task assigned to ${formData.userName} for ${formData.clientName}`);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.message || "Failed to assign task. Please try again later.");
    }
  };

  const resetForm = (): void => {
    setFormData({
      userId: '',
      userName: '',
      clientId: '',
      clientName: '',
      type: 'operation',
      task: '',
      description: '',
      product: '',
    });
    setSelectedDate(new Date());
    setSelectedTime('09:00');
  };

  // Handle field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Time options for the select dropdown
  const timeOptions: string[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      timeOptions.push(`${hourStr}:${minuteStr}`);
    }
  }

  // Handle back button
  const handleBack = (): void => {
    // Navigate back or implement custom back behavior
    window.history.back();
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Assign Task</h1>
        {showSuccess && (
          <Badge className="ml-auto flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Task Assigned
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User Selection with Search Button */}
              <div className="space-y-2">
                <Label htmlFor="user">Assign To*</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Search users..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={searchUsers} 
                      size="icon"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {users.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {users.map((user) => (
                        <div 
                          key={user._id} 
                          className="p-2 hover:bg-accent cursor-pointer flex flex-col border-b last:border-b-0"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              userId: user._id,
                              userName: user.name
                            }));
                            setUsers([]);
                            setUserQuery('');
                          }}
                        >
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.userName && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span>{formData.userName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFormData(prev => ({ ...prev, userId: '', userName: '' }))}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Selection with Search Button */}
              <div className="space-y-2">
                <Label htmlFor="client">Client*</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Search clients..."
                      value={clientQuery}
                      onChange={(e) => setClientQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={searchClients} 
                      size="icon"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {clients.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {clients.map((client) => (
                        <div 
                          key={client._id} 
                          className="p-2 hover:bg-accent cursor-pointer flex flex-col border-b last:border-b-0"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              clientId: client._id,
                              clientName: client.company_name
                            }));
                            setClients([]);
                            setClientQuery('');
                          }}
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{client.company_name}</span>
                            {client.category === "HOT" && (
                              <Badge className="ml-2" variant="destructive">HOT</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {client.address} • {client.contact_person}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.clientName && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span>{formData.clientName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFormData(prev => ({ ...prev, clientId: '', clientName: '' }))}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Task Type*</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operation">Operation</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="task">Task Title*</Label>
                <Input
                  id="task"
                  name="task"
                  placeholder="Enter task title"
                  value={formData.task}
                  onChange={handleInputChange}
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date*</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time*</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select time" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label htmlFor="product">Product/Service</Label>
                <Select 
                  value={formData.product}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((product) => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter task details and any specific instructions"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-20"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={resetForm} 
              className="w-full sm:w-auto"
              type="button"
            >
              Reset
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || showSuccess}
              className="w-full sm:w-auto"
              type="submit"
            >
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </CardFooter>
        </Card>

        {/* Task Summary */}
        {(formData.userName && formData.clientName) && (
          <Card className="w-full mt-4 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Task Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Assignee</p>
                  <p>{formData.userName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Client</p>
                  <p>{formData.clientName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Date & Time</p>
                  <p>{format(selectedDate, 'PP')} at {selectedTime}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Type</p>
                  <p>{formData.type}</p>
                </div>
                {formData.task && (
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Task</p>
                    <p>{formData.task}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignTask;