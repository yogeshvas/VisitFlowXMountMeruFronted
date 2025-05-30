"use client"
import { get_my_profile, change_password } from '@/services/api'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Loader2, ArrowLeft, User, Mail, Briefcase, Calendar, 
  Clock, Users, Lock, KeyRound, Shield, AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"

// Password change form schema
const passwordSchema = z.object({
  oldPassword: z.string().min(6, {
    message: "Old password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.oldPassword, {
  message: "New password must be different from old password",
  path: ["newPassword"],
});

type ProfileData = {
  name: string;
  email: string;
  role: string;
  total_visits: number;
  createdAt: string;
  my_clients: string[];
  visits: string[];
};

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // Added for tab navigation

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get_my_profile();
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setPasswordLoading(true);
      await change_password(values.oldPassword, values.newPassword);
      toast.success("Password changed successfully");
      form.reset();
    } catch (error) {
      console.error("Error changing password", error);
      toast.error("Failed to change password. Please check your old password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium mb-2">Failed to load profile data</p>
          <p className="text-gray-600 mb-4">We couldn't retrieve your profile information. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Extract first letter of first and last name for avatar
  const nameParts = profile.name.split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}` 
    : profile.name.substring(0, 2);

  return (
    <div className="min-h-screen ">
      {/* Improved header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="text-gray-600 hover:text-gray-900 transition-colors mr-4"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header with Avatar */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-20 w-20 text-lg bg-primary text-white border border-black">
              <AvatarFallback><User color="rgb(32,30,30)" /></AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600 mb-1">{profile.email}</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                  <Users className="h-3 w-3 mr-1" />
                  {profile.my_clients.length} Clients
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === "profile" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === "security" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileInfoCard 
                      icon={<User className="h-5 w-5 text-blue-500" />} 
                      title="Personal Details"
                      items={[
                        { label: "Full Name", value: profile.name },
                        { label: "Email Address", value: profile.email },
                        { label: "Role", value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1) }
                      ]}
                    />
                    
                    <ProfileInfoCard 
                      icon={<Clock className="h-5 w-5 text-green-500" />} 
                      title="Activity"
                      items={[
                        { label: "Total Visits", value: profile.total_visits.toString() },
                        { label: "Member Since", value: new Date(profile.createdAt).toLocaleDateString() },
                        { label: "Clients", value: profile.my_clients.length.toString() }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <Card className="border-gray-200 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-amber-500" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password regularly to maintain account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-gray-700">
                                <KeyRound className="h-4 w-4 mr-2 text-gray-500" />
                                Current Password
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your current password" 
                                  type="password" 
                                  {...field} 
                                  className="focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-gray-700">
                                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                                  New Password
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your new password" 
                                    type="password" 
                                    {...field} 
                                    className="focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-gray-700">
                                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                                  Confirm New Password
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Confirm your new password" 
                                    type="password" 
                                    {...field} 
                                    className="focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <Button 
                            type="submit" 
                            className="px-4" 
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for profile info card
const ProfileInfoCard = ({ 
  icon, 
  title,
  items 
}: { 
  icon: React.ReactNode, 
  title: string,
  items: {label: string, value: string}[]
}) => (
  <Card className="shadow-none border-gray-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
            <p className="text-sm text-gray-600">{item.label}</p>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default Profile;