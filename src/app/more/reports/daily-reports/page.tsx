"use client"
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, Download, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getDailyRecord } from '@/services/api';
import { useRouter } from 'next/navigation';

// Move pdfMake imports to a client-side only function
const getPdfLibraries = async () => {
  // Dynamically import pdfMake libraries only on client side
  const pdfMake = (await import('pdfmake/build/pdfmake')).default;
  const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
  
  // Set fonts
  pdfMake.vfs = pdfFonts.vfs;
  
  return pdfMake;
};

const TodayRecord = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface RecordType {
    dailyRecord?: {
      startDateTime?: string;
      endDateTime?: string;
      startAddress?: string;
      endAddress?: string;
    };
    visits?: Array<{
      _id: string;
      client: {
        company_name: string;
        address?: string;
        location?: {
          coordinates: [number, number];
        };
      };
      check_in_time: string;
      comments?: string;
      locationAddress?: string;
    }>;
    status?: string;
    kmTravelled?: number;
  }

  const [record, setRecord] = useState<RecordType | null>(null);
  const router = useRouter();
  
  // Function to fetch coordinates to address using reverse geocoding
  const getAddressFromCoords = async (lat:any, lng:any) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Error fetching address:', error);
      return `${lat}, ${lng}`;
    }
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await getDailyRecord();
        
        // If we have location data, convert to addresses
        if (data?.dailyRecord?.startLocation) {
          const { lat: startLat, lng: startLng } = data.dailyRecord.startLocation;
          data.dailyRecord.startAddress = await getAddressFromCoords(startLat, startLng);
        }
        
        if (data?.dailyRecord?.endLocation) {
          const { lat: endLat, lng: endLng } = data.dailyRecord.endLocation;
          data.dailyRecord.endAddress = await getAddressFromCoords(endLat, endLng);
        }
        
        // Process visits data to get addresses
        if (data?.visits?.length > 0) {
          for (let i = 0; i < data.visits.length; i++) {
            const visit = data.visits[i];
            if (visit.client?.location?.coordinates) {
              const [lng, lat] = visit.client.location.coordinates;
              visit.locationAddress = await getAddressFromCoords(lat, lng);
            }
          }
        }
        
        setRecord(data);
      } catch (err) {
        setError('Failed to load today\'s record. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const formatDateTime = (dateString:any) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
  };

  const formatTime = (dateString:any) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'h:mm a');
  };

  const handleDownloadPdf = async () => {
    if (!record || !record.dailyRecord) return;
    
    try {
      // Get pdfMake library dynamically
      const pdfMake = await getPdfLibraries();
      
      const tripStatus = record?.status || 'No trip recorded';
      const dailyRecord = record?.dailyRecord || null;
      const visits = record?.visits || [];
      const kmTravelled = record?.kmTravelled || 0;
      
      // Define the document definition
      const docDefinition: any = {
        content: [
          { text: 'Daily Record', style: 'header' },
          { text: formatDateTime(dailyRecord.startDateTime).split(',')[0], style: 'subheader' },
          
          // Trip Summary Section
          { text: 'Trip Summary', style: 'sectionHeader', margin: [0, 15, 0, 5] },
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [{ text: 'Status', style: 'tableLabel' }, { text: tripStatus === 'completed' ? 'Completed' : 'In Progress' }],
                [{ text: 'Start Time', style: 'tableLabel' }, { text: formatTime(dailyRecord.startDateTime) }],
                [{ text: 'End Time', style: 'tableLabel' }, { text: dailyRecord.endDateTime ? formatTime(dailyRecord.endDateTime) : 'In progress' }],
                [{ text: 'Start Location', style: 'tableLabel' }, { text: dailyRecord.startAddress || 'Unknown location' }],
                ...(dailyRecord.endDateTime ? [[{ text: 'End Location', style: 'tableLabel' }, { text: dailyRecord.endAddress || 'Unknown location' }]] : []),
                [{ text: 'Distance', style: 'tableLabel' }, { text: `${kmTravelled.toFixed(2)} km` }]
              ]
            },
            layout: 'lightHorizontalLines'
          },
          
          // Client Visits Section
          { text: `Client Visits (${visits.length})`, style: 'sectionHeader', margin: [0, 20, 0, 5] },
          ...(visits.length > 0 ? 
            visits.map((visit, index) => {
              return [
                { text: visit.client.company_name, style: 'visitHeader' },
                { 
                  columns: [
                    { text: 'Check-in:', width: 70, style: 'visitLabel' },
                    { text: formatTime(visit.check_in_time), width: 'auto' }
                  ],
                  margin: [0, 5, 0, 0]
                },
                { 
                  columns: [
                    { text: 'Location:', width: 70, style: 'visitLabel' },
                    { text: visit.locationAddress || visit.client.address || 'Unknown location', width: 'auto' }
                  ],
                  margin: [0, 5, 0, 0]
                },
                ...(visit.comments ? [{ 
                  columns: [
                    { text: 'Comments:', width: 70, style: 'visitLabel' },
                    { text: visit.comments, width: 'auto' }
                  ],
                  margin: [0, 5, 0, 0]
                }] : []),
                ...(index < visits.length - 1 ? [{ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#EEEEEE' }], margin: [0, 10, 0, 10] }] : [])
              ];
            }).flat() 
            : [{ text: 'No client visits recorded for today', style: 'noData', margin: [0, 10, 0, 0] }]
          )
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            alignment: 'center',
            margin: [0, 0, 0, 10],
            color: '#666666'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#333333'
          },
          tableLabel: {
            bold: true,
            color: '#666666'
          },
          visitHeader: {
            fontSize: 12,
            bold: true,
            margin: [0, 5, 0, 0]
          },
          visitLabel: {
            color: '#666666'
          },
          noData: {
            alignment: 'center',
            color: '#999999',
            italics: true
          }
        },
        defaultStyle: {
          fontSize: 10
        }
      };
      
      // Generate the PDF
      const filename = `Daily_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center">Loading today's record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <Button onClick={handleBackClick} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const tripStatus = record?.status || 'No trip recorded';
  const dailyRecord = record?.dailyRecord || null;
  const visits = record?.visits || [];
  const kmTravelled = record?.kmTravelled || 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-xl mx-auto">
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Today's Record</h1>
      </div>

      <div className="p-4 flex-1">
        <div id="report-content" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Trip Summary</CardTitle>
                <Badge 
                  className={tripStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {tripStatus === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {dailyRecord ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Date:</div>
                    <div>{formatDateTime(dailyRecord.startDateTime).split(',')[0]}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Start Time:</div>
                    <div>{formatTime(dailyRecord.startDateTime)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">End Time:</div>
                    <div>{dailyRecord.endDateTime ? formatTime(dailyRecord.endDateTime) : 'In progress'}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Start Location:</div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-xs">{dailyRecord.startAddress || 'Unknown location'}</span>
                    </div>
                  </div>
                  
                  {dailyRecord.endDateTime && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">End Location:</div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="text-xs">{dailyRecord.endAddress || 'Unknown location'}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Distance:</div>
                    <div>{kmTravelled.toFixed(2)} km</div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No trip has been recorded for today
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Client Visits ({visits.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.map((visit, index) => (
                    <div key={visit._id} className="border rounded-lg p-3">
                      <div className="font-medium">{visit.client.company_name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Check-in: {formatTime(visit.check_in_time)}
                      </div>
                      
                      <div className="mt-2 flex items-start">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {visit.locationAddress || visit.client.address || 'Unknown location'}
                        </span>
                      </div>
                      
                      {visit.comments && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Comments:</div>
                          <div className="text-sm mt-1">{visit.comments}</div>
                        </div>
                      )}
                      
                      {index < visits.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No client visits recorded for today
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <Button 
          onClick={handleDownloadPdf} 
          className="w-full" 
          disabled={!dailyRecord}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report as PDF
        </Button>
      </div>
    </div>
  );
};

export default TodayRecord;