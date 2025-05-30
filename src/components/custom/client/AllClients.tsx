"use client"
import React, { useState, useEffect } from 'react';
import { Search, Users, Building, MapPin, Tag, Phone, Mail, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { get_all_clients, search_client } from '@/services/api';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Type definitions for client data
interface Client {
  _id: string;
  company_name: string;
  contact_person: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  category: string;
  status: string;
  best_for: string[] | string;
  follow_up_dates?: { date: string; user: string; _id: string }[];
  [key: string]: any; // For other properties
}

const AllClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('company');
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab !== 'all') {
      filterByCategory(activeTab.toUpperCase());
    } else {
      fetchClients();
    }
  }, [activeTab]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await get_all_clients(currentPage, 10);
      setClients(response.data.clients);
      setTotalPages(response.data.totalPages);
      setTotalClients(response.data.totalClients || response.data.clients.length);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category: string) => {
    setLoading(true);
    try {
      // This would ideally be a server-side filter, but we'll simulate it
      const response = await get_all_clients(1, 100); // Get more to filter from
      const filtered = response.data.clients.filter(
        (client: Client) => client.category === category
      );
      setClients(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
      setTotalClients(filtered.length);
    } catch (error) {
      console.error('Error filtering clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchClients();
      return;
    }
    
    setLoading(true);
    try {
      const response = await search_client(searchQuery);
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        setClients(response.data);
        setTotalPages(Math.ceil(response.data.length / 10));
        setTotalClients(response.data.length);
      } else if (response.data && Array.isArray(response.data.clients)) {
        setClients(response.data.clients);
        setTotalPages(Math.ceil(response.data.clients.length / 10));
        setTotalClients(response.data.clients.length);
      } else {
        setClients([]);
        setTotalPages(1);
        setTotalClients(0);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      setClients([]);
      setTotalClients(0);
    } finally {
      setLoading(false);
    }
  };

  const sortClients = (sortKey: string) => {
    setSortBy(sortKey);
    const sorted = [...clients].sort((a, b) => {
      switch (sortKey) {
        case 'company':
          return a.company_name.localeCompare(b.company_name);
        case 'contact':
          return a.contact_person.localeCompare(b.contact_person);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    setClients(sorted);
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'HOT':
        return 'destructive';
      case 'WARM':
        return 'default';
      case 'COLD':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Follow-Up-Met':
        return 'secondary';
      case 'Follow-Up-Not-Met':
        return 'destructive';
      case 'Proposal Sent':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatTags = (tags: string[] | string) => {
    if (Array.isArray(tags)) {
      return tags.slice(0, 3); // Show at most 3 tags
    } else if (typeof tags === 'string') {
      return [tags];
    }
    return [];
  };

  const viewClient = (clientId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/client/${clientId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl font-bold">All Clients</CardTitle>
          <Badge variant="outline" className="font-normal">
            {totalClients} total
          </Badge>
        </div>
      </CardHeader>
      
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search by company, contact or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="hot">Hot</TabsTrigger>
              <TabsTrigger value="warm">Warm</TabsTrigger>
              <TabsTrigger value="cold">Cold</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => sortClients('company')}>
                    Company Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sortClients('contact')}>
                    Contact Person
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sortClients('category')}>
                    Category
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sortClients('status')}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </Card>
          ))
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <Card 
              key={client._id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewClient(client._id)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-slate-400" />
                    <h3 className="font-semibold text-lg">{client.company_name}</h3>
                  </div>
                  <Badge variant={getCategoryVariant(client.category)}>
                    {client.category}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{client.contact_person}</span>
                  </div>
                  
                  {client.contact_email && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate">{client.contact_email}</span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
                
                {client.best_for && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {formatTags(client.best_for).map((tag, idx) => (
                      <div key={idx} className="flex items-center text-xs bg-slate-100 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3 mr-1 text-slate-500" />
                        <span>{tag}</span>
                      </div>
                    ))}
                    {Array.isArray(client.best_for) && client.best_for.length > 3 && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                        +{client.best_for.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between">
                <Badge variant={getStatusVariant(client.status)}>
                  {client.status.replace(/-/g, ' ')}
                </Badge>
                <Button 
                  size="sm" 
                  onClick={(e) => viewClient(client._id, e)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No clients match your search' : 'No clients found'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  fetchClients();
                }}
              >
                Clear filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllClients;