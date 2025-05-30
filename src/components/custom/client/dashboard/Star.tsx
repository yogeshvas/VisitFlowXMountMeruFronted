import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Calendar, Award } from 'lucide-react';
import { getStarOfTheMonth } from '@/services/api';

const StarOfTheMonth = () => {
  const [starData, setStarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStarData = async () => {
      try {
        const data = await getStarOfTheMonth();
        setStarData(data[0]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load star of the month');
        setLoading(false);
      }
    };

    fetchStarData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <p className="text-gray-500">Loading star of the month...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-24">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!starData) {
    return (
      <div className="flex justify-center items-center h-24">
        <p className="text-gray-500">No star of the month available</p>
      </div>
    );
  }

  // Format date
  const createdDate = new Date(starData.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
      <div className="flex flex-row items-center">
        {/* Left side - Image */}
        <div className="w-1/4  flex items-center justify-center p-4 h-full ml-2">
          <Avatar className="w-24 h-24 border-4 border-amber-300">
            <AvatarImage src={starData.image} alt={starData.name} className="object-cover" />
            <AvatarFallback className="bg-amber-200 text-amber-800 text-xl">
              {starData.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Right side - Information */}
        <div className="w-3/4 p-4 relative">
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 hover:bg-amber-600">
              <Star className="w-4 h-4 mr-1 text-amber-100" /> Star 
            </Badge>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-amber-800">{starData.name}</h2>
            
            <div className="flex items-center text-amber-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            <div className="flex items-start mt-2 bg-white p-2 rounded-lg shadow-inner">
              <Award className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
              <p className="italic text-gray-700 text-sm">"{starData.tagline}"</p>
            </div>
            
            <div className="flex items-center mt-2">
              <Star className="w-4 h-4 text-amber-600 mr-1" fill="currentColor" />
              <Star className="w-4 h-4 text-amber-600 mr-1" fill="currentColor" />
              <Star className="w-4 h-4 text-amber-600 mr-1" fill="currentColor" />
              <Star className="w-4 h-4 text-amber-600 mr-1" fill="currentColor" />
              <Star className="w-4 h-4 text-amber-600" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StarOfTheMonth;