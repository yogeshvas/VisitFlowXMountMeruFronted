"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Cookies from 'js-cookie';

import { Input } from '@/components/ui/input'
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react'
import { login } from '@/services/api'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Logo from "/public/logo.png"


const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(5, {
    message: "Password must be at least 6 characters.",
  }),
})

const Login = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    login(values.email, values.password)
      .then((response) => {
        // Store in localStorage
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Store in cookies
        Cookies.set('refreshToken', response.refreshToken, { 
        });
          
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center  from-background to-muted px-4">
      <div className="w-full max-w-sm space-y-8 rounded-lg  bg-background p-8 ">
        <div className="flex flex-col items-center space-y-2">
          <Image 
                        src={Logo} 
                        alt="VisitFlow Logo" 
                        width={80} 
                        height={80} 
                        className="" 
                      />
            <h1 className="text-2xl font-bold tracking-tight">VisitFlow</h1>
          {/* <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1> */}
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="hello@example.com"
                        type="email"
                        className="h-10 pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                   
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="h-10 pl-9"
                        {...field}
                      />
                    </div>
                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="w-full text-right">
             <a href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
                >
                Forgot password?
            </a>
             </div>
       
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            
          </form>
        
        </Form>

      
                

       
      </div>
    </div>
  )
}

export default Login