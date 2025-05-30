"use client"
import React, { useState, useEffect } from 'react'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addSalesReprentative, getAllManagers } from '@/services/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'



const AddUser = () => {
const router = useRouter();
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    managerId: '',
  })

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await getAllManagers()
        setManagers(data.data)
      } catch (error) {
       toast.error('Failed to fetch managers')
      }
    }
    fetchManagers()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addSalesReprentative(formData)
      toast.success('Sales representative added successfully')
     
      router.back() // Go back after successful submission
    } catch (error) {
      toast.error('Failed to add sales representative')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Add Sales Representative</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="managerId">Manager</Label>
          <Select
            onValueChange={value =>
              setFormData(prev => ({ ...prev, managerId: value }))
            }
            value={formData.managerId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((manager:any) => (
                <SelectItem key={manager._id} value={manager._id}>
                  {manager.name} ({manager.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Adding...' : 'Add Sales Representative'}
        </Button>
      </form>
    </div>
  )
}

export default AddUser