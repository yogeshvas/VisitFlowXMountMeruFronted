"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ArrowDown, CheckCircle, AlertCircle, Activity, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation'; // For navigation
import { getStatus,start,end } from '@/services/api';

const Attendance = () => {
  const router = useRouter();
  const [status, setStatus] = useState({
    status: '',
    message: '',
    date: '',
    kmTravelled: 0,
    hasStarted: false,
    hasEnded: false,
    dailyRecord: {
      startLocation: { lat: 0, lng: 0 },
      endLocation: { lat: 0, lng: 0 },
      startDateTime: '',
      endDateTime: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    // Reverse geocode when locations are available
    if (status.hasStarted && status.dailyRecord?.startLocation?.lat) {
      reverseGeocode(
        status.dailyRecord.startLocation.lat,
        status.dailyRecord.startLocation.lng,
        setStartAddress
      );
    }
    
    if (status.hasEnded && status.dailyRecord?.endLocation?.lat) {
      reverseGeocode(
        status.dailyRecord.endLocation.lat,
        status.dailyRecord.endLocation.lng,
        setEndAddress
      );
    }
  }, [status]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getStatus();
      setStatus(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance status');
      setLoading(false);
    }
  };

  interface ReverseGeocodeResponse {
    display_name?: string;
  }

  const reverseGeocode = async (
    lat: number, 
    lng: number, 
    setAddress: React.Dispatch<React.SetStateAction<string>>
  ): Promise<void> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data: ReverseGeocodeResponse = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      setAddress('Failed to get address');
      console.error('Error fetching address:', error);
    }
  };

  const handleStartTrip = async () => {
    try {
      setLoading(true);
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await start(latitude.toString(), longitude.toString());
          await fetchStatus();
        },
        (err) => {
          setError('Could not get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } catch (err) {
      setError('Failed to start attendance');
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    try {
      setLoading(true);
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await end(latitude.toString(), longitude.toString());
          await fetchStatus();
        },
        (err) => {
          setError('Could not get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } catch (err) {
      setError('Failed to end attendance');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatTime = (dateString:any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString:any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-4 px-2">
      {/* Top navigation bar */}
      <div className="w-full max-w-md flex items-center mb-4 px-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Daily Attendance</h1>
      </div>
      
      <Card className="w-full max-w-md shadow-none border-none">
        <CardHeader className="rounded-t-lg pb-6">
          <div className="flex flex-col items-center">
            <Badge 
              variant={status.hasEnded ? "default" : status.hasStarted ? "secondary" : "outline"}
              className="mb-2"
            >
              {status.hasEnded ? "Completed" : status.hasStarted ? "In Progress" : "Not Started"}
            </Badge>
            <CardTitle className="text-xl text-center font-bold mt-1">
              {formatDate(status.date)}
            </CardTitle>
            <CardDescription className="text-center">
              {status.message || 'Track your daily attendance'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 px-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Start Location */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className={`h-5 w-5 ${status.hasStarted ? 'text-green-500' : 'text-gray-300'} mr-2`} />
                <h3 className="font-medium">Check In</h3>
                {status.hasStarted && (
                  <span className="ml-auto text-sm font-semibold">
                    {formatTime(status.dailyRecord?.startDateTime)}
                  </span>
                )}
              </div>
              
              {status.hasStarted ? (
                <div className="flex items-start mt-1 pl-7">
                  <MapPin className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600 break-words">
                    {startAddress || 'Loading address...'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 pl-7">Not checked in yet</p>
              )}
            </div>

            {/* Direction arrow */}
            {status.hasStarted && (
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-2">
                  <ArrowDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* End Location */}
            {status.hasStarted && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className={`h-5 w-5 ${status.hasEnded ? 'text-green-500' : 'text-gray-300'} mr-2`} />
                  <h3 className="font-medium">Check Out</h3>
                  {status.hasEnded && (
                    <span className="ml-auto text-sm font-semibold">
                      {formatTime(status.dailyRecord?.endDateTime)}
                    </span>
                  )}
                </div>
                
                {status.hasEnded ? (
                  <div className="flex items-start mt-1 pl-7">
                    <MapPin className="h-4 w-4 text-indigo-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600 break-words">
                      {endAddress || 'Loading address...'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 pl-7">Not checked out yet</p>
                )}
              </div>
            )}

            {/* Distance traveled */}
            {status.hasEnded && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <div className="flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">Distance traveled:</span>
                  <span className="ml-2 font-bold text-green-700">
                    {status.kmTravelled} km
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 flex flex-col gap-3">
          <Button 
            onClick={handleStartTrip}
            disabled={status.hasStarted || loading}
            variant={status.hasStarted ? "outline" : "default"}
            className="w-full py-6 text-lg font-medium"
            size="lg"
          >
            {loading && !status.hasEnded ? 
              "Processing..." : 
              status.hasStarted ? "Already Checked In" : "Check In"}
          </Button>
          
          {(status.hasStarted || status.hasEnded) && (
            <Button
              onClick={handleEndTrip}
              disabled={!status.hasStarted || status.hasEnded || loading}
              variant={status.hasEnded ? "outline" : "default"}
              className={`w-full py-6 text-lg font-medium ${!status.hasEnded && "bg-indigo-600 hover:bg-indigo-700"}`}
              size="lg"
            >
              {loading && status.hasStarted ? 
                "Processing..." : 
                status.hasEnded ? "Already Checked Out" : "Check Out"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Attendance;