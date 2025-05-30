'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, FileText, User } from 'lucide-react';
import { getMyClients } from '../../../../services/onboard-apis'; // Adjust path to your API function
import { useTheme } from 'next-themes';

interface Client {
  _id: string;
  doc1: string;
  doc2?: string;
  email: string;
  phoneNumber: string;
  clientName: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  clients: Client[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const MyOnboardedClients = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response: ApiResponse = await getMyClients({ page, limit: 10 });
        setClients(response.clients);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">My Onboarded Clients</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      {/* Main Content */}
      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : clients.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No clients found.
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-4">
              {clients.map((client) => (
                <Card key={client._id} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-5 w-5" />
                      {client.clientName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Email:</span>{' '}
                      {client.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{' '}
                      {client.phoneNumber}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={getStatusColor(client.status)}>
                        {client.status.charAt(0).toUpperCase() +
                          client.status.slice(1)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Comment:</span>{' '}
                      {client.comment || 'N/A'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!client.doc1}
                      >
                        <a
                          href={client.doc1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Doc 1
                        </a>
                      </Button>
                      {client.doc2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={client.doc2}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            Doc 2
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOnboardedClients;