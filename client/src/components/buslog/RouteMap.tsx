import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Navigation } from 'lucide-react';

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LocationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  status: 'rider' | 'prospect' | 'worker';
}

interface RouteMapProps {
  locations: LocationPoint[];
  center?: [number, number]; // [lat, lng]
}

// Component to auto-fit bounds
const FitBounds: React.FC<{ locations: LocationPoint[] }> = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ locations, center = [41.59, -87.5] }) => { 
  // Default to Hammond/Chicago area if no center
  
  const generateGoogleMapsLink = () => {
    if (locations.length === 0) return '';
    
    // Google Maps Directions API format: 
    // https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=Last+Point&waypoints=Point1|Point2|...
    
    const waypoints = locations.map(l => encodeURIComponent(l.address)).join('|');
    // For simplicity, let's just use the optimized waypoints link format
    // But Google Maps URL limit is strict. 
    // Better approach: "Navigate to Next" logic or just open map with markers.
    
    // Let's create a "Route" link that puts all specs in.
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations[locations.length-1].address)}&waypoints=${waypoints}&travelmode=driving`;
  };

  return (
    <div className="space-y-2">
      <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-border z-0 relative">
        <MapContainer 
            center={center} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>{loc.name}</strong><br/>
                  {loc.address}
                </div>
              </Popup>
            </Marker>
          ))}
          
          <FitBounds locations={locations} />
        </MapContainer>
      </div>
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => window.open(generateGoogleMapsLink(), '_blank')}
        disabled={locations.length === 0}
      >
        <Navigation className="w-4 h-4 mr-2" /> Start Navigation (Google Maps)
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Opens Google Maps with optimized route for {locations.length} stops.
      </p>
    </div>
  );
};

export default RouteMap;
