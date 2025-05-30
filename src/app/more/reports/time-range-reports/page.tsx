"use client"
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Calendar, 
  Download, 
  MapPin, 
  ChevronDown, 
  ArrowRight,
  ChevronLeft 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getReportBasedOnTimeStamp } from '@/services/api';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';

// Import types from pdfmake
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// Move pdfMake imports to a client-side only function
const getPdfLibraries = async () => {
  // Dynamically import pdfMake libraries only on client side
  const pdfMake = (await import('pdfmake/build/pdfmake')).default;
  const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
  
  // Set fonts
  pdfMake.vfs = pdfFonts.vfs;
  
  return pdfMake;
};

const TimeRangeReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const fetchReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      setError("Please select a valid date range");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const response = await getReportBasedOnTimeStamp(startDate, endDate);
      
      if (response.success) {
        setReportData(response.data.data);
      } else {
        setError(response.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the report data");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const handleDownloadPdf = async () => {
    if (!reportData) return;
    
    try {
      // Get pdfMake library dynamically
      const pdfMake = await getPdfLibraries();
      
      const { summary, dailyReports } = reportData;
      
      // Create content for document definition
      let contentArray: Content[] = [
        { text: 'Time Range Report', style: 'header' },
        { 
          text: `${formatDate(summary.dateRange.start)} to ${formatDate(summary.dateRange.end)}`,
          style: 'subheader'
        },
        
        // Summary Section
        { text: 'Summary', style: 'sectionHeader', margin: [0, 15, 0, 5] },
        {
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'Total Distance', style: 'tableLabel' }, { text: `${summary.totalKm.toFixed(2)} km` }],
              [{ text: 'Total Visits', style: 'tableLabel' }, { text: summary.totalVisits }],
              [{ text: 'Total Working Days', style: 'tableLabel' }, { text: summary.totalWorkingDays }],
              [{ text: 'Average Distance/Day', style: 'tableLabel' }, { text: `${summary.averageKmPerDay} km` }],
              [{ text: 'Average Visits/Day', style: 'tableLabel' }, { text: summary.averageVisitsPerDay }],
              [{ text: 'Total Days in Range', style: 'tableLabel' }, { text: summary.dateRange.days }]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        
        // Daily Reports Section
        { text: 'Daily Reports', style: 'sectionHeader', margin: [0, 20, 0, 5] }
      ];
      
      // Add daily reports to content
      if (dailyReports.length > 0) {
        dailyReports.forEach((day: any) => {
          // Add day header and summary
          contentArray.push(
            { text: formatDate(day.date), style: 'dayHeader', margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['40%', '60%'],
                body: [
                  [{ text: 'Distance', style: 'tableLabel' }, { text: `${day.kmTravelled.toFixed(2)} km` }],
                  [{ text: 'Visit Count', style: 'tableLabel' }, { text: day.visitCount }],
                  [{ text: 'Working Hours', style: 'tableLabel' }, { text: `${day.workingHours || 0} hours` }]
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 10]
            }
          );
          
          // Add visits section
          if (day.visits && day.visits.length > 0) {
            contentArray.push({ text: 'Visits:', style: 'subSectionHeader', margin: [0, 5, 0, 5] });
            
            day.visits.forEach((visit: any, vIndex: number) => {
              contentArray.push({ text: visit.client.company_name, style: 'visitHeader', margin: [0, 5, 0, 0] });
              contentArray.push({
                columns: [
                  { text: 'Check-in:', width: 70, style: 'visitLabel' },
                  { text: formatDateTime(visit.check_in_time).split(', ')[1], width: 'auto' }
                ],
                margin: [0, 2, 0, 0]
              });
              contentArray.push({
                columns: [
                  { text: 'Location:', width: 70, style: 'visitLabel' },
                  { text: visit.client.address || 'Unknown location', width: 'auto' }
                ],
                margin: [0, 2, 0, 0]
              });
              
              if (visit.comments) {
                contentArray.push({
                  columns: [
                    { text: 'Comments:', width: 70, style: 'visitLabel' },
                    { text: visit.comments, width: 'auto' }
                  ],
                  margin: [0, 2, 0, 0]
                });
              }
              
              // Add separator between visits except after the last one
              if (vIndex < day.visits.length - 1) {
                contentArray.push({ 
                  canvas: [{ 
                    type: 'line', 
                    x1: 0, 
                    y1: 5, 
                    x2: 515, 
                    y2: 5, 
                    lineWidth: 1, 
                    lineColor: '#EEEEEE' 
                  }], 
                  margin: [0, 5, 0, 5] 
                });
              }
            });
          } else {
            contentArray.push({ text: 'No visits recorded', style: 'noData', margin: [0, 5, 0, 0] });
          }
        });
      } else {
        contentArray.push({ text: 'No daily reports available for the selected time range', style: 'noData' });
      }
      
      // Define the document definition with proper typing
      const docDefinition: TDocumentDefinitions = {
        content: contentArray,
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
          subSectionHeader: {
            fontSize: 12,
            bold: true,
            color: '#555555'
          },
          dayHeader: {
            fontSize: 13,
            bold: true,
            color: '#444444',
            decoration: 'underline'
          },
          tableLabel: {
            bold: true,
            color: '#666666'
          },
          visitHeader: {
            fontSize: 12,
            bold: true
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
      const filename = `Report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white mx-auto max-w-xl">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white z-10 p-3 border-b flex items-center shadow-sm">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Time Range Reports</h1>
      </div>

      <div className="p-3 flex-1">
        {/* Date Range Selector */}
        <Card className="shadow-sm mb-4">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Select Date Range</CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="flex flex-col gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={(value) => {
                  if (value.from && value.to) {
                    setDateRange({ from: value.from, to: value.to });
                  }
                }}
                className="w-full"
              />
              <Button 
                onClick={fetchReport}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-center text-sm">Generating report...</p>
          </div>
        )}

        {!loading && reportData && (
          <div className="space-y-4">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-2 mb-3 w-full">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="daily">Daily Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <Card className="shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Report Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-600 font-medium">Total Distance</div>
                        <div className="text-lg font-bold mt-1">{reportData.summary.totalKm.toFixed(2)} km</div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-medium">Total Visits</div>
                        <div className="text-lg font-bold mt-1">{reportData.summary.totalVisits}</div>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-xs text-purple-600 font-medium">Working Days</div>
                        <div className="text-lg font-bold mt-1">{reportData.summary.totalWorkingDays}</div>
                      </div>
                      
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-xs text-amber-600 font-medium">Avg. Distance/Day</div>
                        <div className="text-lg font-bold mt-1">{reportData.summary.averageKmPerDay} km</div>
                      </div>
                      
                      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                        <div className="text-xs text-cyan-600 font-medium">Avg. Visits/Day</div>
                        <div className="text-lg font-bold mt-1">{reportData.summary.averageVisitsPerDay}</div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-600 font-medium">Date Range</div>
                        <div className="text-xs font-medium mt-1">
                          {formatDate(reportData.summary.dateRange.start)}
                          <ArrowRight className="inline mx-1 h-3 w-3" />
                          {formatDate(reportData.summary.dateRange.end)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">({reportData.summary.dateRange.days} days)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="daily">
                <Card className="shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Daily Reports ({reportData.dailyReports.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <Accordion type="single" collapsible className="w-full">
                      {reportData.dailyReports.length > 0 ? (
                        reportData.dailyReports.map((day: any, index: number) => (
                          <AccordionItem key={day.date} value={`day-${index}`}>
                            <AccordionTrigger className="hover:bg-gray-50 px-2 py-3 rounded-md text-sm">
                              <div className="flex items-center justify-between w-full">
                                <div className="font-medium text-left">{formatDate(day.date)}</div>
                                <div className="flex gap-2 mr-6">
                                  <Badge variant="outline" className="bg-blue-50 text-xs">
                                    {day.kmTravelled.toFixed(2)} km
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-xs">
                                    {day.visitCount} visits
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="border-t pt-3">
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="p-2 bg-gray-50 rounded border">
                                  <div className="text-xs text-gray-500">Distance</div>
                                  <div className="font-medium text-sm">{day.kmTravelled.toFixed(2)} km</div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded border">
                                  <div className="text-xs text-gray-500">Visits</div>
                                  <div className="font-medium text-sm">{day.visitCount}</div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded border">
                                  <div className="text-xs text-gray-500">Hours</div>
                                  <div className="font-medium text-sm">{day.workingHours || "0.00"}</div>
                                </div>
                              </div>
                              
                              {day.visits && day.visits.length > 0 ? (
                                <div className="mt-3">
                                  <h4 className="text-xs font-medium mb-2">Visits ({day.visitCount})</h4>
                                  <div className="space-y-2">
                                    {day.visits.map((visit: any) => (
                                      <div key={visit.check_in_time} className="border rounded-lg p-2">
                                        <div className="font-medium text-sm">{visit.client.company_name}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Check-in: {formatDateTime(visit.check_in_time).split(', ')[1]}
                                        </div>
                                        
                                        <div className="mt-2 flex items-start">
                                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                                          <span className="text-xs text-gray-500">
                                            {visit.client.address || 'Unknown location'}
                                          </span>
                                        </div>
                                        
                                        {visit.comments && (
                                          <div className="mt-2">
                                            <div className="text-xs text-gray-500">Comments:</div>
                                            <div className="text-xs mt-1">{visit.comments}</div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="py-3 text-center text-gray-500 text-xs">
                                  No visits recorded on this day
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-500 text-sm">
                          No daily reports available for the selected time range
                        </div>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {reportData && (
        <div className="sticky bottom-0 bg-white border-t p-3 shadow-md">
          <Button 
            onClick={handleDownloadPdf} 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeRangeReports;