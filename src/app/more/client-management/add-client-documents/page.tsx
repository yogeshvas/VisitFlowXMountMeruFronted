"use client";
import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Check, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { onboardClient } from '@/services/onboard-apis';
import { useRouter } from 'next/navigation';


const OnboardClient = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phoneNumber: '',
    comment: ''
  });
  const [doc1, setDoc1] = useState<File | null>(null);
  const [doc2, setDoc2] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docNum: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (docNum === 1) {
        setDoc1(file);
        toast.success('ID document uploaded');
      } else {
        setDoc2(file);
        toast.success('Additional document uploaded');
      }
    }
  };

  const removeFile = (docNum: number) => {
    if (docNum === 1) {
      setDoc1(null);
      toast.message('ID document removed', { icon: '🗑️' });
    } else {
      setDoc2(null);
      toast.message('Additional document removed', { icon: '🗑️' });
    }
  };

  const validateForm = () => {
    if (!formData.clientName.trim()) {
      toast.error('Please enter client name');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid client email');
      return false;
    }
    if (!formData.phoneNumber.trim() || !/^\d{9,12}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a valid client phone number (9 to 12 digits)');
      return false;
    }
    if (!doc1) {
      toast.error('Please upload an ID document');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      toast.loading('Processing your request...', { id: 'submitting' });

      if (!doc1) {
        throw new Error('doc1 is required but is null');
      }

      await onboardClient({
        clientName: formData.clientName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        comment: formData.comment,
        doc1: doc1 as File,
        doc2: doc2 || undefined
      });

      toast.success('Client successfully onboarded!', { id: 'submitting', duration: 3000 });
      router.back();
      // Reset form
      setFormData({
        clientName: '',
        email: '',
        phoneNumber: '',
        comment: ''
      });
      setDoc1(null);
      setDoc2(null);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to onboard client. Please try again.', { id: 'submitting' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUpload = ({ docNum, file }: { docNum: number; file: File | null }) => (
    <div className="space-y-2">
      <Label>{docNum === 1 ? 'Pakra Document (Required)' : 'Additional Document (Optional)'}</Label>
      {!file ? (
        <div className="relative">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Upload {docNum === 1 ? 'Pakra Doc' : 'document'}</span>
            <Input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, docNum)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Check className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFile(docNum)}
            className="hover:bg-gray-200"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            aria-label="Go back"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Onboard New Client</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <Card className="max-w-2xl mx-auto border-0 shadow-none rounded-none">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter client's email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter client's phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Additional Comments</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Any additional information about the client"
                  className="min-h-[100px]"
                />
              </div>

              <FileUpload docNum={1} file={doc1} />
              <FileUpload docNum={2} file={doc2} />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Onboard Client'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OnboardClient;