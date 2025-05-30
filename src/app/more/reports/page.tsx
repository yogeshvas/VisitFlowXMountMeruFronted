"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Reports = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const navigateToDailyReport = () => {
    router.push('/more/reports/daily-reports');
  };

  const navigateToTimeRangeReport = () => {
    router.push('/more/reports/time-range-reports');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-xl mx-auto">
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Reports</h1>
      </div>

      <div className="p-4 flex-1">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <button
                className="w-full text-left p-4 flex items-center"
                onClick={navigateToDailyReport}
              >
                <div className="bg-gray-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium text-base">Daily Report</h2>
                  <p className="text-gray-500 text-sm truncate">View and download today's attendance record</p>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <button
                className="w-full text-left p-4 flex items-center"
                onClick={navigateToTimeRangeReport}
              >
                <div className="bg-gray-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium text-base">Weekly Report</h2>
                  <p className="text-gray-500 text-sm truncate">View attendance history for the past week</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;