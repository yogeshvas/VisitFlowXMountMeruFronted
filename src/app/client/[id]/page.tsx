"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  PencilIcon, 
  Building, 
  Phone, 
  Mail, 
  Users, 
  CalendarClock, 
  MapPin, 
  CarFront,
  Plus,
  PhoneCall,
  Map
} from "lucide-react"
import { format } from 'date-fns'
import { add_visit, get_client_by_id } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from 'react-hot-toast'

const visitFormSchema = z.object({
  visitConclusion: z.string().min(1, "Visit conclusion is required"),
  status: z.string().min(1, "Status is required"),
  followupDate: z.date().optional(),
});

const ClientDetails = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    interface Client {
      company_name: string;
      category: string;
      address: string;
      fleet_size: number;
      contact_person: string;
      contact_phone: string;
      contact_email: string;
      no_of_employees: number;
      best_for: string[];
      comment: string;
      location: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
      };
      visits: {
        _id: string;
        check_in_time: string;
        sales_rep: { name: string };
        comments: string;
      }[];
    }
    
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    
    const form = useForm({
      resolver: zodResolver(visitFormSchema),
      defaultValues: {
        visitConclusion: "",
        status: "",
        followupDate: undefined,
      },
    });
    
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await get_client_by_id(id);
                if (response.success) {
                    setClient(response.data);
                }
            } catch (error) {
                console.error("Error fetching client:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchClientData();
    }, [id]);

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/client/edit/${id}`);
    };
    
    const handleCallClient = () => {
      if (client?.contact_phone) {
        window.location.href = `tel:${client.contact_phone}`;
      } else {
        toast.error("No phone number available for this client");
      }
    };
    
    const handleOpenMaps = () => {
      if (client?.location?.coordinates) {
        const [longitude, latitude] = client.location.coordinates;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(mapsUrl, '_blank');
      } else {
        toast.error("No location data available for this client");
      }
    };
    
    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        
        try {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                
                const Visitresponse = await add_visit(
                  id,
                  data.visitConclusion,
                  latitude,
                  longitude,
                  data.status,
                  data.followupDate ? format(data.followupDate, 'yyyy-MM-dd') : ''
                );
                console.log(Visitresponse);
                
                toast.success("Visit added successfully");
                const response = await get_client_by_id(id);
                if (response.success) {
                  setClient(response.data);
                }
                
                form.reset();
                setOpen(false);
              } catch (error: any) {
                console.error("Error adding visit:", error);
                toast.error(error.response?.data?.message || error.message);
              } finally {
                setIsSubmitting(false);
              }
            },
            (error) => {
              console.error("Error getting location:", error);
              toast.error("Could not get your current location. Please check your device settings.");
              setIsSubmitting(false);
            }
          );
        } catch (error) {
          console.error("Error in submission:", error);
          toast.error("An unexpected error occurred. Please try again.");
          setIsSubmitting(false);
        }
      };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-4">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card>
                    <CardContent className="p-6">
                        <p>Client not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 pb-32 max-w-md mx-auto relative">
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={handleBack} className="p-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">{client.company_name}</h1>
                <Button variant="ghost" onClick={handleEdit} className="p-2">
                    <PencilIcon className="h-5 w-5" />
                </Button>
            </div>

            <Badge className="mb-4" variant={"default"}>
                {client?.category}
            </Badge>

            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Building className="mr-2 h-4 w-4" />
                                    Company
                                </div>
                                <p className="font-medium">{client?.company_name}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Address
                                </div>
                                <p className="font-medium">{client?.address}</p>
                                <Button 
                                    variant="outline" 
                                    className="p-0 h-auto font-normal text-primary" 
                                    onClick={handleOpenMaps}
                                >
                                    <Map className="mr-1 h-4 w-4" />
                                    Open in Maps
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <CarFront className="mr-2 h-4 w-4"/>
                                    Fleet Size
                                </div>
                                <p className="font-medium">{client?.fleet_size}</p>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    Contact Person
                                </div>
                                <p className="font-medium">{client.contact_person}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Phone
                                </div>
                                <p className="font-medium">{client?.contact_phone}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email
                                </div>
                                <p className="font-medium">{client?.contact_email}</p>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    Employees
                                </div>
                                <p className="font-medium">{client.no_of_employees}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground mb-1">
                                    Best For
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {client?.best_for.map((item, index) => (
                                        <Badge key={index} variant="outline">{item}</Badge>
                                    ))}
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">
                                    Comments
                                </div>
                                <p>{client?.comment}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="visits">
                    <Card>
                        <CardContent className="p-4">
                            {client.visits && client.visits.length > 0 ? (
                                <div className="space-y-8 relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-muted"></div>
                                    
                                    {client.visits.map((visit, index) => (
                                        <div key={visit?._id} className="relative pl-8 ml-4">
                                            <div className="absolute left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"></div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(visit?.check_in_time), 'PPP p')}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                                                            {visit?.sales_rep?.name.charAt(0)}
                                                        </div>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{visit?.sales_rep?.name}</span>
                                                </div>
                                                
                                                <div className="bg-muted p-3 rounded-lg">
                                                    <p className="text-sm">{visit?.comments}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-6">No visits recorded yet</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            {/* Fixed Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex space-x-2 max-w-md mx-auto">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex-1">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Visit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Visit</DialogTitle>
                            <DialogDescription>
                                Record your visit details for {client.company_name}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="visitConclusion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Visit Discussion</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter visit details and conclusions" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Action Plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Active">Welcome</SelectItem>
                                                    <SelectItem value="Proposal Sent">Send Proposal</SelectItem>
                                                    <SelectItem value="Pricing Sent">Send Pricing</SelectItem>
                                                    <SelectItem value="Closed">Closed</SelectItem>
                                                    <SelectItem value="Follow-Up-Met">Follow-Up and Met Client</SelectItem>
                                                    <SelectItem value="Follow-Up-Not-Met">Follow-Up and not Met</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="followupDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Follow-up Date (Optional)</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className="pl-3 text-left font-normal"
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span className="text-muted-foreground">Pick a date</span>
                                                            )}
                                                            <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <DialogFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="relative"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="opacity-0">Submit</span>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                </div>
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="flex-1" onClick={handleCallClient}>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call Client
                </Button>
            </div>
        </div>
    );
};

export default ClientDetails;