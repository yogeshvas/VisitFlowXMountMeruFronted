/** @format */

"use client";
import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Users,
  Tag,
  Truck,
  MapPinned,
  MessageSquare,
  Loader2,
  Camera,
  Image,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { add_client } from "@/services/api";
import { useRouter } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for the extracted business card data
interface BusinessCardData {
  "Company Name"?: string;
  "Contact Person"?: string;
  "Contact Email"?: string;
  "Contact Phone"?: string;
  Address?: string;
}

// Interface for the location object
interface Location {
  lat: number;
  lng: number;
}

// Separate function to extract business card information
const extractBusinessCardInfo = async (
  file: File,
  apiKey: string
): Promise<BusinessCardData> => {
  try {
    // Convert the image to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    const base64String = await base64Promise;

    // Set up Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the request
    const filePart = {
      inlineData: {
        data: base64String,
        mimeType: file.type,
      },
    };

    // Prompt to extract specific details from the business card
    const prompt = `
      Extract the following information from the business card image, or any other image in a structured JSON format:
      - Company Name
      - Contact Person
      - Contact Email
      - Contact Phone
      - Address
      Return the result as a valid JSON object, without any markdown or code fences.
      if you dont find any feild just return empty string of values with keys.
    `;

    const result = await model.generateContent([prompt, filePart]);
    const generatedText = result.response.text();

    // Clean the response by removing markdown code fences and trimming whitespace
    const cleanedText = generatedText
      .replace(/```json\n?/, "") // Remove opening ```json
      .replace(/\n?```/, "") // Remove closing ```
      .trim(); // Remove leading/trailing whitespace

    console.log("Cleaned Text:", cleanedText);

    // Parse the cleaned text as JSON
    const extractedData: BusinessCardData = JSON.parse(cleanedText);
    return extractedData;
  } catch (error) {
    console.error("Error extracting business card info:", error);
    throw new Error("Failed to extract information from the image");
  }
};

const AddClient: React.FC = () => {
  // Form state with TypeScript types
  const [companyName, setCompanyName] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [noOfEmployees, setNoOfEmployees] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [location, setLocation] = useState<Location>({ lat: 0, lng: 0 });
  const [address, setAddress] = useState<string>("");
  const [fleetSize, setFleetSize] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const router = useRouter();

  // Camera and Gallery input refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Location loading state
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  // Dropdown options
  const categoryOptions: string[] = ["HOT", "COLD", "WARM"];
  const bestForOptions: string[] = [
    "MFS",
    "FORCE 1",
    "MERU GAS",
    "E-COM",
    "Other",
  ];

  // Toggle bestFor selection
  const toggleBestFor = (value: string): void => {
    setBestFor((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Reverse Geocoding Function
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "Unable to fetch address";
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Unable to fetch address";
    }
  };

  // Get Current Location
  const getCurrentLocation = (): void => {
    if ("geolocation" in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Reverse geocode to get address
          const fetchedAddress = await reverseGeocode(latitude, longitude);
          setAddress(fetchedAddress);

          setIsLoadingLocation(false);
          toast.success("Location fetched successfully", {
            style: {
              backgroundColor: "#4CAF50",
              color: "white",
            },
          });
        },
        (error: GeolocationPositionError) => {
          setIsLoadingLocation(false);
          toast.error("Failed to get current location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = (): void => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Handle Gallery Selection
  const handleGallerySelection = (): void => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Handle Image Processing (both camera and upload)
  const processImage = async (uploadedFile: File): Promise<void> => {
    if (!uploadedFile) {
      toast.error("Please select an image file.");
      return;
    }

    setFile(uploadedFile);
    setIsLoadingImage(true);

    try {
      const apiKeys = [
        process.env.NEXT_PUBLIC_GEMINI_API_1,
        process.env.NEXT_PUBLIC_GEMINI_API_2,
        process.env.NEXT_PUBLIC_GEMINI_API_3,
        process.env.NEXT_PUBLIC_GEMINI_API_4,
        process.env.NEXT_PUBLIC_GEMINI_API_5,
        process.env.NEXT_PUBLIC_GEMINI_API_6,
      ].filter((key): key is string => typeof key === "string"); // Type guard to ensure only strings

      if (apiKeys.length === 0) {
        throw new Error("No valid API keys available.");
      }

      const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
      console.log("Using API Key:", apiKey);
      const extractedData = await extractBusinessCardInfo(uploadedFile, apiKey);

      // Pre-fill the form fields with extracted data
      setCompanyName(extractedData["Company Name"] || "");
      setContactPerson(extractedData["Contact Person"] || "");
      setContactEmail(extractedData["Contact Email"] || "");
      setContactPhone(extractedData["Contact Phone"] || "");
      setIsLoadingImage(false);
      toast.success("Business card information extracted successfully", {
        style: {
          backgroundColor: "#4CAF50",
          color: "white",
        },
      });
    } catch (error: any) {
      toast.error(
        error.message || "Failed to extract business card information."
      );
      setIsLoadingImage(false);
    }
  };

  // Handle Camera Input Change
  const handleCameraInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      await processImage(uploadedFile);
    }
  };

  // Handle Gallery Input Change
  const handleGalleryInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      await processImage(uploadedFile);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      // Validate required fields
      if (
        !companyName ||
        !contactPerson ||
        !contactEmail ||
        !address ||
        bestFor.length === 0 ||
        !category
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Create GeoJSON Point object for MongoDB
      const locationData = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };

      const clientData = {
        company_name: companyName,
        contact_person: contactPerson,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        category,
        best_for: bestFor,
        no_of_employees: noOfEmployees,
        comment,
        location: locationData,
        address,
        fleet_size: fleetSize,
      };

      const response = await add_client(
        clientData.company_name,
        clientData.contact_person,
        clientData.contact_email,
        clientData.contact_phone,
        clientData.category,
        clientData.best_for,
        clientData.no_of_employees,
        clientData.comment,
        clientData.location,
        clientData.address,
        clientData.fleet_size
      );

      toast.success("Client added successfully");
      router.push("/client");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-screen">
      {/* Header with Camera and Gallery Buttons */}
      <div className="flex items-center justify-between mb-6 border-b pb-4 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <Building className="mr-2 h-5 w-5 md:h-6 md:w-6" />
            Add New Client
          </h1>
        </div>

        {/* Camera and Gallery Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCameraCapture}
            disabled={isLoadingImage}
            className="relative"
            title="Take photo with camera"
          >
            {isLoadingImage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGallerySelection}
            disabled={isLoadingImage}
            className="relative"
            title="Select from gallery"
          >
            {isLoadingImage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Image className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden Camera Input - for taking photos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        style={{ display: "none" }}
      />

      {/* Hidden Gallery Input - for selecting from gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryInputChange}
        style={{ display: "none" }}
      />

      {/* Loading Indicator for Image Processing */}
      {isLoadingImage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
            <span className="text-blue-700 text-sm">
              Processing your image...
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information Section */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <Building className="mr-2 h-4 w-4" /> Company Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Enter company name"
              value={companyName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCompanyName(e.target.value)
              }
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <User className="mr-2 h-4 w-4" /> Contact Person
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Contact person name"
              value={contactPerson}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setContactPerson(e.target.value)
              }
              required
              className="text-base"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <Mail className="mr-2 h-4 w-4" /> Contact Email
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setContactEmail(e.target.value)
              }
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <Phone className="mr-2 h-4 w-4" /> Contact Phone
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Phone number"
              value={contactPhone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setContactPhone(e.target.value)
              }
              required
              className="text-base"
            />
          </div>
        </div>

        {/* Categorization */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <Tag className="mr-2 h-4 w-4" /> Category
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select
              value={category}
              onValueChange={(value: string) => setCategory(value)}
              required
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium">
              <Truck className="mr-2 h-4 w-4" /> Fleet Size
            </label>
            <Input
              type="number"
              placeholder="Number of vehicles"
              value={fleetSize}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFleetSize(e.target.value)
              }
              className="text-base"
            />
          </div>
        </div>

        {/* Best For Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium">
            <MapPinned className="mr-2 h-4 w-4" /> Best For
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {bestForOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`best-for-${option}`}
                  checked={bestFor.includes(option)}
                  onCheckedChange={() => toggleBestFor(option)}
                />
                <label
                  htmlFor={`best-for-${option}`}
                  className="text-sm cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium">
            <Users className="mr-2 h-4 w-4" /> Number of Employees
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="number"
            placeholder="Total employees"
            value={noOfEmployees}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNoOfEmployees(e.target.value)
            }
            required
            className="text-base"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium">
            <MapPin className="mr-2 h-4 w-4" /> Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter address"
              value={address}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAddress(e.target.value)
              }
              className="flex-grow text-base"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoadingLocation}
              onClick={getCurrentLocation}
              title="Get current location"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Hidden Coordinates */}
        <Input
          type="hidden"
          value={location.lat}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLocation((prev) => ({
              ...prev,
              lat: Number(e.target.value),
            }))
          }
        />
        <Input
          type="hidden"
          value={location.lng}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLocation((prev) => ({
              ...prev,
              lng: Number(e.target.value),
            }))
          }
        />

        {/* Comments */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium">
            <MessageSquare className="mr-2 h-4 w-4" /> Additional Comments
          </label>
          <textarea
            className="w-full p-3 border rounded-md text-base"
            placeholder="Any additional information"
            value={comment}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setComment(e.target.value)
            }
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full h-12 text-base font-medium">
          Add Client
        </Button>
      </form>
    </div>
  );
};

export default AddClient;
