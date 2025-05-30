"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, FileText, User, Calendar, Phone, Mail, AlertCircle } from 'lucide-react';
import { getAllClientOnboardings, getClientById, updateClientStatus, searchClients } from '../../../../services/onboard-apis';
import toast from 'react-hot-toast';

interface Client {
  _id: string;
  doc1: string;
  doc2: string;
  email: string;
  phoneNumber: string;
  clientName: string;
  userId: { _id: string; name: string; email: string } | null;
  status: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  clients: Client[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const ClientOnboarding: React.FC = () => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');

  // Fetch all clients
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await getAllClientOnboardings({ page, limit: 10, status: status as "pending" | "approved" | "rejected" | undefined });
      setClients(response.clients);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  // Search clients
  const handleSearch = async () => {
    if (!searchQuery) return fetchClients();
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await searchClients({ query: searchQuery, page, limit: 10, status: status as "pending" | "approved" | "rejected" | undefined });
      setClients(response.clients);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to search clients');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch client by ID
  const fetchClientById = async (clientId: string) => {
    setIsLoading(true);
    try {
      const client = await getClientById(clientId);
      setSelectedClient(client as any);
      setComment(client.comment || '');
    } catch (error) {
      toast.error('Failed to fetch client details');
    } finally {
      setIsLoading(false);
    }
  };

  // Update client status
  const handleStatusUpdate = async (clientId: string, status: any) => {
    try {
      await updateClientStatus({ clientId, status, comment });
      toast.success('Client status updated successfully');
      fetchClientById(clientId);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    if (!selectedClient) fetchClients();
  }, [page, statusFilter]);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  // Client List Loading Skeleton
  const ClientListSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Client List Screen
  if (!selectedClient) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="mr-3 rounded-full h-10 w-10 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">
                Client Onboarding
              </h1>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
              {clients.length} Clients
            </Badge>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="flex w-full items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button 
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Client List */}
          {isLoading ? (
            <ClientListSkeleton />
          ) : clients.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-medium">No clients found</h3>
              <p className="mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <Card
                  key={client._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => fetchClientById(client._id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          {client.clientName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Onboarded on {new Date(client.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(client.status)}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm">{client.phoneNumber}</span>
                      </div>
                    </div>
                    {client.comment && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm italic">"{client.comment}"</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-3">
                    <span className="text-sm font-medium">
                      <FileText className="h-4 w-4 inline mr-1" /> 2 Documents Available
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center text-sm px-4">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Client Details Screen
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedClient(null)} 
            className="mr-3 rounded-full h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            Client Details
          </h1>
        </div>

        {isLoading ? (
          <Card className="p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {selectedClient.clientName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Client ID: {selectedClient._id.substring(0, 8)}...
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(selectedClient.status)}>
                  {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3" />
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3" />
                        <span>{selectedClient.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Documents</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <a 
                        href={selectedClient.doc1} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-3 bg-background rounded-md border hover:shadow-sm transition-all"
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Pakra Document</p>
                          <p className="text-xs text-muted-foreground">View document</p>
                        </div>
                      </a>
                      <a 
                        href={selectedClient.doc2} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-3 bg-background rounded-md border hover:shadow-sm transition-all"
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Document 2</p>
                          <p className="text-xs text-muted-foreground">View document</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {selectedClient.userId && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Onboarded By</h3>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-3" />
                          <div>
                            <p className="font-medium">{selectedClient.userId.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.userId.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Onboarded on</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3" />
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p>
                            {new Date(selectedClient.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {/* <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3" />
                        <div>
                          <p className="text-sm text-muted-foreground">Updated</p>
                          <p>
                            {new Date(selectedClient.updatedAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-2">Comment</h3>
                <div className="bg-muted rounded-lg p-4">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-background"
                  />
                </div>
              </div>
              
              <Separator className="my-8" />
              
              {/* Status Update */}
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Update Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={selectedClient.status === 'pending' ? 'secondary' : 'outline'}
                    onClick={() => handleStatusUpdate(selectedClient._id, 'pending')}
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant={selectedClient.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate(selectedClient._id, 'approved')}
                  >
                    Approve Client
                  </Button>
                  <Button
                    variant={selectedClient.status === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => handleStatusUpdate(selectedClient._id, 'rejected')}
                  >
                    Reject Client
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientOnboarding;