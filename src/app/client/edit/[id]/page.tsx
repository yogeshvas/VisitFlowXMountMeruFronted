/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { get_client_by_id, edit_client_details } from "@/services/api";

const EditClient = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [noOfEmployees, setNoOfEmployees] = useState("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState("");
  const [fleetSize, setFleetSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Dropdown options
  const categoryOptions = ["HOT", "COLD", "WARM"];
  const statusOptions = [
    "Active",
    "Proposal Sent",
    "Pricing Sent",
    "Closed",
    "Follow-Up-Met",
    "Follow-Up-Not-Met",
    "Other",
  ];

  const bestForOptions: string[] = [
    "MFS",
    "FORCE 1",
    "MERU GAS",
    "E-COM",
    "Other",
  ];

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await get_client_by_id(id);
        if (response.success && response.data) {
          const client = response.data;

          setCompanyName(client.company_name || "");
          setContactPerson(client.contact_person || "");
          setContactEmail(client.contact_email || "");
          setContactPhone(client.contact_phone || "");
          setCategory(client.category || "");
          setStatus(client.status || "Active");
          setBestFor(client.best_for || []);
          setNoOfEmployees(client.no_of_employees?.toString() || "");
          setComment(client.comment || "");
          setFleetSize(client.fleet_size?.toString() || "");
          setAddress(client.address || "");

          // Set location if available
          if (client.location && client.location.coordinates) {
            setLocation({
              lng: client.location.coordinates[0] || 0,
              lat: client.location.coordinates[1] || 0,
            });
          }
        } else {
          toast.error("Failed to load client data");
        }
      } catch (error) {
        toast.error("Error fetching client data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClientData();
    }
  }, [id]);

  // Toggle bestFor selection
  const toggleBestFor = (value: string) => {
    setBestFor((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Reverse Geocoding Function
  const reverseGeocode = async (lat: number, lng: number) => {
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
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Reverse geocode to get address
          const fetchedAddress = await reverseGeocode(latitude, longitude);
          setAddress(fetchedAddress);

          setIsLoadingLocation(false);
          toast.success("Location updated successfully");
        },
        (error) => {
          setIsLoadingLocation(false);
          toast.error("Failed to get current location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
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

      // Create location object for API
      const locationData = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };

      const response = await edit_client_details(
        id,
        companyName,
        address,
        contactPerson,
        contactEmail,
        contactPhone,
        category,
        status,
        bestFor.join(","), // API expects a string, not an array
        noOfEmployees,
        comment,
        locationData
      );

      toast.success(response.message);
      router.back();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center mb-6 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <Building className="mr-3" />
          Edit Client
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <Building className="mr-2" /> Company Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <User className="mr-2" /> Contact Person
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Contact person name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <Mail className="mr-2" /> Contact Email
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <Phone className="mr-2" /> Contact Phone
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder="Phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Categorization */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <Tag className="mr-2" /> Category
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
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
            <label className="flex items-center">
              <CheckCircle className="mr-2" /> Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <Users className="mr-2" /> Number of Employees
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="number"
              placeholder="Total employees"
              value={noOfEmployees}
              onChange={(e) => setNoOfEmployees(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <Truck className="mr-2" /> Fleet Size
            </label>
            <Input
              type="number"
              placeholder="Number of vehicles"
              value={fleetSize}
              onChange={(e) => setFleetSize(e.target.value)}
            />
          </div>
        </div>

        {/* Best For Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center">
            <MapPinned className="mr-2" /> Potential Product
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

        {/* Location */}
        <div className="space-y-2">
          <label className="flex items-center">
            <MapPin className="mr-2" /> Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter address"
              value={address}
              disabled
              className="flex-grow"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoadingLocation}
              onClick={getCurrentLocation}
              title="Update location"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
            </Button>
          </div>
          {location.lat !== 0 && location.lng !== 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="flex items-center">
            <MessageSquare className="mr-2" /> Additional Comments
          </label>
          <textarea
            className="w-full p-3 border rounded-md"
            placeholder="Any additional information"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-1/2">
            Update Client
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditClient;
