import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Text } from 'ol/style';
import 'ol/ol.css';
import { Card } from './ui/card';

interface TerritoryMapProps {
  selectedTerritory?: string;
  onTerritorySelect?: (territory: string) => void;
  showLabels?: boolean;
}

// Territory boundaries (approximate coordinates for demo)
const territories = {
  'Mumbai': {
    name: 'Mumbai',
    coordinates: [[
      [72.7757, 18.8945],
      [72.9947, 18.8945],
      [72.9947, 19.2703],
      [72.7757, 19.2703],
      [72.7757, 18.8945]
    ]],
    center: [72.8777, 19.0760],
    color: 'rgba(59, 130, 246, 0.3)'
  },
  'Delhi': {
    name: 'Delhi',
    coordinates: [[
      [76.8388, 28.4041],
      [77.3465, 28.4041],
      [77.3465, 28.8836],
      [76.8388, 28.8836],
      [76.8388, 28.4041]
    ]],
    center: [77.1025, 28.7041],
    color: 'rgba(34, 197, 94, 0.3)'
  },
  'Bangalore': {
    name: 'Bangalore',
    coordinates: [[
      [77.4601, 12.8342],
      [77.7840, 12.8342],
      [77.7840, 13.1437],
      [77.4601, 13.1437],
      [77.4601, 12.8342]
    ]],
    center: [77.5946, 12.9716],
    color: 'rgba(168, 85, 247, 0.3)'
  },
  'Kolkata': {
    name: 'Kolkata',
    coordinates: [[
      [88.2636, 22.4697],
      [88.4386, 22.4697],
      [88.4386, 22.6500],
      [88.2636, 22.6500],
      [88.2636, 22.4697]
    ]],
    center: [88.3639, 22.5726],
    color: 'rgba(251, 146, 60, 0.3)'
  },
  'Hyderabad': {
    name: 'Hyderabad',
    coordinates: [[
      [78.2436, 17.2403],
      [78.6417, 17.2403],
      [78.6417, 17.5607],
      [78.2436, 17.5607],
      [78.2436, 17.2403]
    ]],
    center: [78.4867, 17.3850],
    color: 'rgba(236, 72, 153, 0.3)'
  },
  'Katra (Vaishno Devi)': {
    name: 'Katra (Vaishno Devi)',
    coordinates: [[
      [74.8800, 32.9000],
      [75.0500, 32.9000],
      [75.0500, 33.0500],
      [74.8800, 33.0500],
      [74.8800, 32.9000]
    ]],
    center: [74.9320, 32.9915],
    color: 'rgba(147, 51, 234, 0.3)'
  },
  'Ahmedabad': {
    name: 'Ahmedabad',
    coordinates: [[
      [72.4500, 22.9000],
      [72.7500, 22.9000],
      [72.7500, 23.1500],
      [72.4500, 23.1500],
      [72.4500, 22.9000]
    ]],
    center: [72.5714, 23.0225],
    color: 'rgba(234, 179, 8, 0.3)'
  },
  'Surat': {
    name: 'Surat',
    coordinates: [[
      [72.6800, 21.0800],
      [72.9500, 21.0800],
      [72.9500, 21.2800],
      [72.6800, 21.2800],
      [72.6800, 21.0800]
    ]],
    center: [72.8311, 21.1702],
    color: 'rgba(20, 184, 166, 0.3)'
  },
  'Vadodara': {
    name: 'Vadodara',
    coordinates: [[
      [73.0800, 22.2000],
      [73.3000, 22.2000],
      [73.3000, 22.4000],
      [73.0800, 22.4000],
      [73.0800, 22.2000]
    ]],
    center: [73.2080, 22.3072],
    color: 'rgba(239, 68, 68, 0.3)'
  }
};

export const TerritoryMap = ({ 
  selectedTerritory, 
  onTerritorySelect,
  showLabels = true 
}: TerritoryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source with territory features
    const vectorSource = new VectorSource();

    Object.entries(territories).forEach(([key, territory]) => {
      const feature = new Feature({
        geometry: new Polygon(territory.coordinates).transform('EPSG:4326', 'EPSG:3857'),
        name: territory.name
      });

      const isSelected = selectedTerritory === key;
      const isHovered = hoveredTerritory === key;

      feature.setStyle(new Style({
        fill: new Fill({
          color: isSelected 
            ? territory.color.replace('0.3', '0.6')
            : isHovered
            ? territory.color.replace('0.3', '0.5')
            : territory.color
        }),
        stroke: new Stroke({
          color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
          width: isSelected ? 3 : 2
        }),
        text: showLabels ? new Text({
          text: territory.name,
          font: 'bold 14px sans-serif',
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#000', width: 3 }),
          offsetY: 0
        }) : undefined
      }));

      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    // Initialize map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Center of India
        zoom: 5
      })
    });

    // Add click interaction
    map.on('click', (evt) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const name = feature.get('name');
        if (name && onTerritorySelect) {
          onTerritorySelect(name);
        }
        return true;
      });
    });

    // Add hover interaction
    map.on('pointermove', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const name = feature.get('name');
        setHoveredTerritory(name);
        map.getTargetElement().style.cursor = 'pointer';
      } else {
        setHoveredTerritory(null);
        map.getTargetElement().style.cursor = '';
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [selectedTerritory, hoveredTerritory, onTerritorySelect, showLabels]);

  // Update map when selected territory changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedTerritory && territories[selectedTerritory as keyof typeof territories]) {
      const territory = territories[selectedTerritory as keyof typeof territories];
      mapInstanceRef.current.getView().animate({
        center: fromLonLat(territory.center),
        zoom: 11,
        duration: 1000
      });
    }
  }, [selectedTerritory]);

  return (
    <Card className="p-0 overflow-hidden">
      <div ref={mapRef} className="w-full h-[500px]" />
      {hoveredTerritory && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-lg">
          <p className="text-sm font-medium">{hoveredTerritory}</p>
          <p className="text-xs text-muted-foreground">Click to select</p>
        </div>
      )}
    </Card>
  );
};
