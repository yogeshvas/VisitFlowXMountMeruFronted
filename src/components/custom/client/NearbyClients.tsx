"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react'

// Extend the Window interface to include the google property
declare global {
  interface Window {
    google: any;
  }
}
import { MapPin, ExternalLink, Map as MapIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useRouter}  from 'next/navigation'
import { get_nearby_clients } from '@/services/api'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

const RANGE_STORAGE_KEY = 'nearby_clients_range'
const GOOGLE_MAPS_API_KEY = 'AIzaSyC8zy45f-dWZWg0P4A9mGAZjNlMYTnJRvI'

// Types
interface Client {
  _id: string;
  company_name: string;
  category: string;
  status: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  fleet_size: number;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface LocationCoords {
  lat: number;
  lng: number;
}

type LocationPermissionStatus = 'granted' | 'denied' | 'requesting';

// Custom hook for Google Maps loading
const useGoogleMaps = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If already loaded
    if (window.google) {
      setIsLoaded(true)
      return;
    }

    const scriptId = 'google-maps-script'
    
    // Check if already loading
    if (document.getElementById(scriptId)) {
      const checkIfLoaded = setInterval(() => {
        if (window.google) {
          setIsLoaded(true)
          clearInterval(checkIfLoaded)
        }
      }, 100)
      return;
    }
    
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    const handleScriptLoad = () => {
      setIsLoaded(true)
    }
    
    const handleScriptError = (error: Event) => {
      setLoadError(new Error('Failed to load Google Maps script'))
    }
    
    script.addEventListener('load', handleScriptLoad)
    script.addEventListener('error', handleScriptError)
    
    document.head.appendChild(script)
    
    return () => {
      script.removeEventListener('load', handleScriptLoad)
      script.removeEventListener('error', handleScriptError)
    }
  }, [apiKey])

  return { isLoaded, loadError }
}

interface MapComponentProps {
  userLocation: LocationCoords;
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client) => void;
  handleViewDetails: (clientId: string) => void;
}

// Map Component
const MapComponent: React.FC<MapComponentProps> = ({ 
  userLocation, 
  clients, 
  selectedClient, 
  setSelectedClient, 
  handleViewDetails 
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, loadError } = useGoogleMaps(GOOGLE_MAPS_API_KEY)
  const [mapInitialized, setMapInitialized] = useState<boolean>(false)
  const markersRef = useRef<google.maps.Marker[] >([])
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  
  // Initialize map
  useEffect(() => {
    if (!isLoaded || !userLocation || !mapRef.current || mapInitialized) return;
    
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 14,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
      
      // Add user marker
      new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: 'Your Location'
      })
      
      mapInstanceRef.current = map
      setMapInitialized(true)
    } catch (err) {
      console.error('Error initializing map:', err)
    }
  }, [isLoaded, userLocation, mapInitialized])
  
  // Handle markers
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current || !clients.length) return;
    
    try {
      // Clear previous markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      
      const infoWindow = new window.google.maps.InfoWindow()
      const bounds = new window.google.maps.LatLngBounds()
      
      // Add user location to bounds
      if (userLocation) {
        bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng))
      }
      
      // Add client markers
      clients.forEach(client => {
        const { coordinates } = client.location
        // Note: Google Maps uses [lat, lng] but GeoJSON uses [lng, lat]
        const position = { lat: coordinates[1], lng: coordinates[0] }
        bounds.extend(new window.google.maps.LatLng(position.lat, position.lng))
        
        const getCategoryMarkerColor = (category: string): string => {
          switch (category) {
            case 'HOT': return 'red'
            case 'WARM': return 'yellow'
            case 'COLD': return 'blue'
            case 'WARD': return 'purple'
            default: return 'green'
          }
        }
        
        // Create marker
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          label: {
            text: client.company_name,
            color: 'red',
            fontWeight: 'bold',
            fontSize: '12px',
            className: 'marker-label'
          },
          title: client.company_name,
          icon: {
            url: `http://maps.google.com/mapfiles/ms/icons/${getCategoryMarkerColor(client.category)}-dot.png`,
            labelOrigin: new window.google.maps.Point(15, -10)
          }
        })
        
        marker.addListener('click', () => {
          setSelectedClient(client)
          const content = `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0; font-weight: bold;">${client.company_name}</h3>
              <p style="margin: 4px 0;">${client.category} - ${client.status}</p>
              <p style="margin: 4px 0; font-size: 12px;">${client.address}</p>
              <button id="view-details-${client._id}" 
                style="background-color: #2563eb; color: white; border: none; 
                padding: 6px 12px; border-radius: 4px; margin-top: 8px; 
                cursor: pointer; width: 100%;">
                View Details
              </button>
            </div>
          `
          infoWindow.setContent(content)
          infoWindow.open(mapInstanceRef.current, marker)
          
          // Add event listener to the button after infoWindow is opened
          setTimeout(() => {
            const detailButton = document.getElementById(`view-details-${client._id}`)
            if (detailButton) {
              detailButton.addEventListener('click', () => {
                handleViewDetails(client._id)
              })
            }
          }, 100)
        })
        
        markersRef.current.push(marker)
      })
      
      // Fit map to bounds with padding
      mapInstanceRef.current.fitBounds(bounds, 50)
      
      // Adjust zoom level if too zoomed in
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', function() {
       
        window.google.maps.event.removeListener(listener)
      })
    } catch (err) {
      console.error('Error adding markers:', err)
    }
  }, [clients, mapInitialized, userLocation, setSelectedClient, handleViewDetails])
  
  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center p-4">
          <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Map failed to load</h3>
          <p className="mt-1 text-sm text-gray-500">Please check your connection and try again</p>
          <div className="mt-6">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  if (!isLoaded) {
    return <Skeleton className="h-full w-full rounded-lg" />
  }
  
  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}

const NearbyClients: React.FC = () => {
  // Initialize range from localStorage or default to 5
  const getSavedRange = (): number => {
    if (typeof window === 'undefined') return 5;
    const savedRange = localStorage.getItem(RANGE_STORAGE_KEY)
    return savedRange ? parseInt(savedRange) : 5
  }

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [range, setRange] = useState<number>(getSavedRange())
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('requesting')
  const router = useRouter()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationPermission('requesting')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationPermission('granted')
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationPermission('denied')
          setError('Unable to get your location. Please enable location services.')
          setLoading(false)
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationPermission('denied')
      setError('Geolocation is not supported by your browser')
      setLoading(false)
    }
  }, [])

  // Fetch nearby clients once we have user location
  useEffect(() => {
    const fetchNearbyClients = async () => {
      if (!userLocation) return

      try {
        setLoading(true)
        const data = await get_nearby_clients(userLocation.lat, userLocation.lng, range)
        setClients(data.clients || [])
        setLoading(false)
      } catch (err) {
        console.error('Error fetching nearby clients:', err)
        setError('Failed to load nearby clients')
        setLoading(false)
      }
    }

    if (userLocation) {
      fetchNearbyClients()
    }
  }, [userLocation, range])

  const handleViewDetails = useCallback((clientId: string) => {
    router.push(`/client/${clientId}`)
  }, [router])

  // Handle range change and save to localStorage
  const handleRangeChange = (value: string) => {
    const newRange = parseInt(value)
    setRange(newRange)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(RANGE_STORAGE_KEY, value)
    }
  }

  // Get category badge color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'HOT':
        return 'bg-red-500'
      case 'WARM':
        return 'bg-orange-500'
      case 'COLD':
        return 'bg-blue-500'
      case 'WARD':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Location permission denied view
  if (locationPermission === 'denied') {
    return (
      <div className="p-4 text-center h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Location access needed</h3>
          <p className="mt-1 text-sm text-gray-500">
            This feature requires access to your location to find nearby clients.
            Please enable location services in your browser settings and try again.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading && locationPermission === 'requesting') {
    return (
      <div className="h-screen w-full p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <p>Range: </p>
          <div className="w-[100px]">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="flex-1 rounded-lg mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center h-screen flex items-center justify-center">
        <div>
          <p className="text-red-500">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-4" style={{ height: '90vh' }}>
      {/* Range Dropdown */}
      <div className="bg-white z-10 mb-4">
        <div className="flex justify-between items-center">
          <p>Range: </p>
          <div className="w-[100px]">
            <Select 
              onValueChange={handleRangeChange} 
              defaultValue={range.toString()}
              value={range.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Search Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1KM</SelectItem>
                <SelectItem value="3">3KM</SelectItem>
                <SelectItem value="5">5KM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className="w-full flex-1 border border-zinc-200 rounded-2xl mb-4"
        style={{ height: selectedClient ? 'calc(60vh - 100px)' : 'calc(70vh - 100px)' }}
      >
        {userLocation && (
          <MapComponent
            userLocation={userLocation}
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            handleViewDetails={handleViewDetails}
          />
        )}
      </div>
      
      {/* Client List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto" style={{ maxHeight: '200px' }}>
        {clients.length > 0 ? clients.map(client => (
          <Card 
            key={client._id} 
            className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer ${selectedClient && selectedClient._id === client._id ? 'ring-2 ring-blue-500' : ''}`}
            style={{ borderLeftColor: getCategoryColor(client.category).replace('bg-', '') }}
            onClick={() => setSelectedClient(client)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{client.company_name}</h3>
                <Badge className={getCategoryColor(client.category) + ' text-white'}>
                  {client.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center mb-2">
                <MapPin size={12} className="mr-1" />
                {client.address.length > 50 
                  ? client.address.substring(0, 50) + '...' 
                  : client.address}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {client.status}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(client._id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No clients found within {range}km range. Try increasing your search range.
          </div>
        )}
      </div>
    </div>
  )
}

export default NearbyClients