import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, MarkerF as Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Group, TextInput, Text, Button, Modal } from '@mantine/core';
import { Icon } from '@iconify/react';

type LatLng = { lat: number; lng: number };

interface MapPickerProps {
  value: LatLng | null;
  onChange: (next: LatLng | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
  height?: number;
}

const defaultCenter: LatLng = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad as a sensible default

export const MapPicker = ({ value, onChange, label = 'Location', required, error, height = 300 }: MapPickerProps) => {
  const libraries = useMemo(() => ['places'] as ("places")[], []);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Expanded modal state
  const [expanded, setExpanded] = useState(false);
  const modalAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const modalInputRef = useRef<HTMLInputElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const setSearchInputs = useCallback((addr?: string | null) => {
    if (!addr) return;
    if (inputRef.current) inputRef.current.value = addr;
    if (modalInputRef.current) modalInputRef.current.value = addr;
  }, []);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  const logLocationDetails = useCallback((next: LatLng, origin: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[MapPicker] Location selected from:', origin);
        console.log('[MapPicker] LatLng:', next);
      }
      const geocoder = geocoderRef.current;
      if (geocoder) {
        geocoder.geocode({ location: next }, (results, status) => {
          if (import.meta.env.DEV) {
            console.log('[MapPicker] Geocode status:', status);
            if (status === 'OK') {
              console.log('[MapPicker] Geocode results:', results);
            }
          }
          if (status === 'OK') {
            const addr = results && results[0]?.formatted_address;
            setSearchInputs(addr || null);
          }
        });
      }
    } catch (err) {
      if (import.meta.env.DEV) console.log('[MapPicker] Log error:', err);
    }
  }, [setSearchInputs]);

  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handlePlaceChanged = () => {
    const ac = autocompleteRef.current;
    if (!ac) return;
    const place: google.maps.places.PlaceResult = ac.getPlace();
    if (import.meta.env.DEV) console.log('[MapPicker] Autocomplete place:', place);
    const loc = place?.geometry?.location;
    if (!loc) return;
    const next = { lat: loc.lat(), lng: loc.lng() };
    onChange(next);
    map?.panTo(next);
    map?.setZoom(15);
    const formatted = place.formatted_address;
    if (formatted) setSearchInputs(formatted);
    logLocationDetails(next, 'autocomplete');
  };

  const handleModalPlaceChanged = () => {
    const ac = modalAutocompleteRef.current;
    if (!ac) return;
    const place: google.maps.places.PlaceResult = ac.getPlace();
    if (import.meta.env.DEV) console.log('[MapPicker] Modal autocomplete place:', place);
    const loc = place?.geometry?.location;
    if (!loc) return;
    const next = { lat: loc.lat(), lng: loc.lng() };
    onChange(next);
    const formatted = place.formatted_address;
    if (formatted) setSearchInputs(formatted);
    logLocationDetails(next, 'modal-autocomplete');
  };

  return (
    <div>
      {label && (
        <Text fw={600} size="sm">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Text>
      )}

      <Group mt="xs" gap="xs" wrap="nowrap" justify="space-between" align="center">
        <div className="flex-1">
          {isLoaded && (
            <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={handlePlaceChanged}
              fields={["geometry.location", "name", "formatted_address"]}
            >
              <TextInput ref={inputRef} placeholder="Search a place" className="flex-1" />
            </Autocomplete>
          )}
        </div>
        <Button size="xs" variant="light" leftSection={<Icon icon="mdi:arrow-expand" width="16" height="16" />} onClick={() => setExpanded(true)}>
          Expand
        </Button>
      </Group>

      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName={height === 260 ? 'w-full h-[260px]' : 'w-full h-[300px]'}
            center={value || defaultCenter}
            zoom={value ? 15 : 11}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
            onClick={(e) => {
              if (!e.latLng) return;
              const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
              onChange(next);
              logLocationDetails(next, 'map-click');
            }}
            options={{
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined,
              mapTypeControl: false, // disables Map/Satellite toggle
              fullscreenControl: false,
              streetViewControl: false,
              clickableIcons: false,
              draggableCursor: 'default',
            }}
          >
            {value && (
              <Marker
                position={value}
                draggable
                onDragEnd={(e) => {
                  if (!e.latLng) return;
                  const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                  onChange(next);
                  map?.panTo(next);
                  logLocationDetails(next, 'marker-drag');
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className={height === 260 ? 'h-[260px]' : 'h-[300px]'}>
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Text size="sm" c="dimmed">Loading map…</Text>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Text c="red" size="xs" mt={6}>
          {error}
        </Text>
      )}

      {/* Expanded Map Modal */}
      <Modal opened={expanded} onClose={() => setExpanded(false)} title={<Text fw={600}>Select Location</Text>} centered size="xl">
        {isLoaded && (
          <div className="mb-2">
            <Autocomplete
              onLoad={(ac) => (modalAutocompleteRef.current = ac)}
              onPlaceChanged={handleModalPlaceChanged}
              fields={["geometry.location", "name", "formatted_address"]}
            >
              <TextInput ref={modalInputRef} placeholder="Search a place" />
            </Autocomplete>
          </div>
        )}
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName={'w-full h-[70vh]'}
            center={value || defaultCenter}
            zoom={value ? 15 : 11}
            onClick={(e) => {
              if (!e.latLng) return;
              const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
              onChange(next);
              logLocationDetails(next, 'modal-map-click');
            }}
            options={{
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined,
              mapTypeControl: false,
              fullscreenControl: false,
              streetViewControl: false,
              clickableIcons: false,
              draggableCursor: 'default',
            }}
          >
            {value && (
              <Marker
                position={value}
                draggable
                onDragEnd={(e) => {
                  if (!e.latLng) return;
                  const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                  onChange(next);
                  logLocationDetails(next, 'modal-marker-drag');
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100">
            <Text size="sm" c="dimmed">Loading map…</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default memo(MapPicker);
