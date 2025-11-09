import { memo, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Text } from '@mantine/core';

export type LatLng = { lat: number; lng: number };

interface MapViewProps {
  center?: LatLng;
  zoom?: number;
  heightClassName?: string; // e.g., 'h-[360px]'
  onLoad?: (map: google.maps.Map) => void;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

const defaultCenter: LatLng = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad

const MapView = ({ center = defaultCenter, zoom = 11, heightClassName = 'h-[360px]', onLoad, onClick, children }: MapViewProps) => {
  const libraries = useMemo(() => ['places'] as ("places")[], []);
  const { isLoaded } = useJsApiLoader({
    // Use a single, consistent loader id across the app to avoid
    // "Loader must not be called again with different options" errors
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  if (!isLoaded) {
    return (
      <div className={`w-full ${heightClassName} bg-gray-100 flex items-center justify-center`}>
        <Text size="sm" c="dimmed">Loading map…</Text>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={`w-full ${heightClassName}`}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onClick={onClick}
      options={{
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        clickableIcons: false,
        draggableCursor: 'default',
      }}
    >
      {children}
    </GoogleMap>
  );
};

export default memo(MapView);
