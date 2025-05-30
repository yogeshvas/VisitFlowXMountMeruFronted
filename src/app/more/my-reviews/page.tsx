"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { ArrowLeft, Star } from 'lucide-react';
import { myReviews } from '@/services/reviews-api';
interface Review {
  _id: string;
  review: string;
  rating: number;
  client: {
    company_name: string;
    address: string;
    contact_person: string;
    contact_email: string;
  };
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalReviews: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: PaginationData;
  };
}

const MyReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalReviews: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (page: number) => {
    try {
      setLoading(true);
      const response: ApiResponse = await myReviews(pagination.pageSize, page);
      if (response.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError('An error occurred while fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchReviews(newPage);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute left-4 top-4"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-lg font-semibold text-center">My Reviews</h1>
      </header>

      <ScrollArea className="flex-1 p-4">
        {loading && (
          <div className="text-center">Loading reviews...</div>
        )}
        {error && (
          <div className="text-center text-destructive">{error}</div>
        )}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center">No reviews found.</div>
        )}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="w-full">
              <CardHeader>
                <CardTitle className="text-base">
                  {review.client.company_name}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{review.review}</p>
                <p className="text-xs text-muted-foreground">
                  <strong>Contact:</strong> {review.client.contact_person} (
                  {review.client.contact_email})
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Address:</strong> {review.client.address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Posted:</strong>{' '}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {pagination.totalPages > 1 && (
        <div className="sticky bottom-0 bg-background border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className={
                    pagination.currentPage === 1 || loading
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === pagination.currentPage}
                      className={loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className={
                    pagination.currentPage === pagination.totalPages || loading
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default MyReviews;