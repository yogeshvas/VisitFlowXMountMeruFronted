"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star, Upload, User, Save, PlusCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addStartOfTheMonthWith, getStarOfTheMonth, updateStarOfTheMonth } from '@/services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const UserPerformance = () => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: '',
      tagline: '',
    }
  });

  const [activeTab, setActiveTab] = useState('view');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStar, setCurrentStar] = useState<{ _id?: string; name?: string; tagline?: string; image?: string } | null>(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentStar();
  }, []);

  const fetchCurrentStar = async () => {
    try {
      setLoading(true);
      const data = await getStarOfTheMonth();
      
      // Handle the array response - take the first item if it exists
      const starData = Array.isArray(data) && data.length > 0 ? data[0] : data;
      setCurrentStar(starData);
      
      // Initialize form with current data
      if (starData) {
        form.reset({
          name: starData.name || '',
          tagline: starData.tagline || '',
        });
      }
    } catch (error) {
      toast.error("Failed to fetch star of the month data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formValues:any) => {
    setSubmitting(true);

    try {
      // Combine form values with image file
      const submitData = {
        ...formValues,
        imageFile: imageFile,
        id: currentStar?._id,
      };

      // Validate
      if (!submitData.name || !submitData.tagline) {
        throw new Error("Name and tagline are required");
      }

      if (!submitData.imageFile && !currentStar) {
        throw new Error("Please upload an image");
      }

      // Add or update based on whether there's a current star
      if (currentStar) {
        await updateStarOfTheMonth(submitData);
        toast.success("Star of the Month updated successfully!");
      } else {
        await addStartOfTheMonthWith(submitData);
        toast.success("Star of the Month added successfully!");
      }

      // Refresh data
      await fetchCurrentStar();
      setActiveTab('view');
    } catch (error:any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Start of the month</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="view">View Star</TabsTrigger>
          <TabsTrigger value="edit">
            {currentStar ? "Edit Star" : "Add Star"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentStar ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Star of the Month
                </CardTitle>
                <CardDescription>
                  Recognizing excellence in performance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={currentStar.image} alt={currentStar.name} />
                    <AvatarFallback>
                      <User className="h-16 w-16 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-center">{currentStar.name}</h3>
                  <div className="mt-2 text-center text-muted-foreground italic">
                    "{currentStar.tagline}"
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('edit')}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <div className="text-center text-muted-foreground mb-4">
                  No star of the month has been set yet
                </div>
                <Button onClick={() => setActiveTab('edit')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Star of the Month
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStar ? "Update Star of the Month" : "Add Star of the Month"}
              </CardTitle>
              <CardDescription>
                {currentStar 
                  ? "Update the current employee's information" 
                  : "Recognize an outstanding employee"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter employee name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievement Tagline</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a short description of their achievement"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief statement about their accomplishments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Employee Photo</FormLabel>
                    <div className="flex flex-col items-center border rounded-md p-4">
                      {(imagePreview || (currentStar && !imagePreview)) && (
                        <div className="mb-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={imagePreview || (currentStar?.image || '')} />
                            <AvatarFallback>
                              <User className="h-12 w-12" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-md flex items-center justify-center w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview || (currentStar && currentStar.image)
                          ? "Change Photo"
                          : "Upload Photo"
                        }
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <FormDescription className="text-center mt-2">
                        {currentStar && !imageFile
                          ? "Leave empty to keep current image"
                          : "JPG, PNG or GIF, max 3MB"
                        }
                      </FormDescription>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('view')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPerformance;