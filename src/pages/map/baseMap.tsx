import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Search, ZoomIn, ZoomOut, Maximize2, Sidebar, LocateFixedIcon, Map, MapPin, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Latlng, Territory, getMapLocations, getTerritoryByLatLng, getUnderServedAreas, searchTerritory } from '../../apis/apiService';
import {
  setCenter,
  setZoom,
  setStyle,
  setLayerMenu,
  setSearchQuery,
  toggleLayerMenu,
} from '../../store/slices/mapSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomDrawer from '@/components/shared/CustomDrawer';
import Searchinput from './component/Searchinput';
import GlobalLoader from '@/components/shared/GlobalLoader';
import ViewProjects from './component/projects/ViewProjects';
import ViewPulses from './component/pulses/ViewPulses';
import { ViewTerritories } from './component/territories/ViewTerritories';
import { set } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './component/profile/ProfileMenu';



const BaseMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [allTerritories, setAllTerritories] = useState<Territory[]>([]);
  const navigation = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { style: mapStyle, isLayerMenuOpen: showLayerMenu, searchQuery } = useSelector((s: RootState) => s.map);
  const [showPulses, setShowPulses] = useState(false);
  const [showTerritories, setShowTerritories] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);
  const { user, logout }: any = useAuth();
  const navigate = useNavigate();

  let userInfo;
  // Retrieve user roles from localStorage, fallback to user?.role
  let userRoles: string[] = [];
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    userRoles = Array.isArray(userInfo.userRoles) ? userInfo.userRoles : [];
  } catch (error) {
    console.error('Error parsing userInfo from localStorage:', error);
  }

  const mapStyles: Record<string, { name: string; url: string }> = {
    streets: { name: 'Streets', url: 'https://demotiles.maplibre.org/style.json' },
    satellite: { name: 'Satellite', url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL' },
    terrain: { name: 'Terrain', url: 'https://api.maptiler.com/maps/outdoor/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL' }
  };

  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Add or update the marker at the user's location
        if (marker) {
          marker.setLngLat([longitude, latitude]);
        } else {
          const el = document.createElement('div');
          el.className = 'marker-blue';
          const newMarker = new maplibregl.Marker({ element: el, className: 'marker-blue' })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
          setMarker(newMarker);
        }

        // Fetch the territory for the user's location
        try {
          const territory = await getTerritoryByLatLng(longitude, latitude);
          handleTerritorySelect(territory);
        } catch (error) {
          console.error('Error fetching territory:', error);
          alert('Failed to fetch territory for your location.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    );
  };

  const handleDrawerState = (open: boolean) => {
    setDrawerOpen(open);

    if (!open) {
      if (map.current) {
        clearPolygon();
        clearProjectPolygons();
      }
      setSelectedProject(null);
      setTerritory(null);
    }
  };



  const handleTerritorySelect = (territoryData: Territory | null) => {
    clearProjectPolygons(); // reset any previous territory's projects

    if (!territoryData) {
      clearPolygon();
      setDrawerOpen(false);
      return;
    }

    setTerritory(territoryData);

    if (territoryData.geometry) {
      plotPolygon(territoryData.geometry);
    }

    if (territoryData.projects && territoryData.projects.length > 0) {
      plotProjectPolygons(territoryData.projects);
    }

    setSearchResults([]);
    dispatch(setSearchQuery(''));

    setDrawerOpen(true);
  };


  const removeDefaultLabels = () => {
    const m = map.current;
    if (!m) return;

    m.getStyle().layers?.forEach((layer) => {
      if (layer.type === 'symbol' && layer.id !== 'territories-labels') {
        m.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  };

  const clearProjectPolygons = () => {
    const m = map.current;
    if (!m) return;

    const src = m.getSource("projects-source");
    if (!src) return;  // prevents crash

    (src as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: []
    });
  };

  const plotProjectPolygons = (projects: any[]) => {
    const m = map.current;
    if (!m || !projects?.length) {
      clearProjectPolygons();
      return;
    }

    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = projects
      .filter(p => p.geometry)
      .map(p => ({
        type: "Feature",
        geometry: p.geometry,
        properties: { ...p }
      }));

    const src = m.getSource("projects-source") as maplibregl.GeoJSONSource;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features
      });
    }
  };



  const loadAllTerritoryPoints = async () => {
    const m = map.current;
    if (!m) return;

    const items = await getMapLocations();
    setAllTerritories(items);
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: items.map((t) => ({
        type: 'Feature',
        properties: { name: t.name },
        geometry: t.center
      }))
    };

    const src = m.getSource('territories') as maplibregl.GeoJSONSource;
    if (src) src.setData(geojson);
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: mapStyles[mapStyle]?.url ?? mapStyles.streets.url,
      center: [72.5714, 23.0225],
      zoom: 12,
      attributionControl: false,

    });

    map.current.on('styledata', () => {
      removeDefaultLabels();
      if (!allTerritories.length) loadAllTerritoryPoints();
    });

    map.current.on('load', () => {
      const m = map.current;
      if (!m) return;

      // territory points
      m.addSource('territories', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // badge-like label layer
      m.addLayer({
        id: 'territories-labels',
        type: 'symbol',
        source: 'territories',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 15,
          'text-justify': 'center',
          'text-padding': 8,
          'text-letter-spacing': 0.05,
          'text-font': ['Roboto'],
          'icon-image': 'circle-15',
          'icon-size': 1.5,
          'icon-allow-overlap': true,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#1f2937',
          'text-halo-width': 2
        }
      });

      // single polygon selection source
      m.addSource('selected-territory', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // fill layer
      m.addLayer({
        id: 'selected-territory-fill',
        type: 'fill',
        source: 'selected-territory',
        paint: {
          'fill-color': '#2563eb',
          'fill-opacity': 0.25,
        }
      }, 'territories-labels' // place below labels
      );

      // outline layer
      m.addLayer({
        id: 'selected-territory-line',
        type: 'line',
        source: 'selected-territory',
        paint: {
          'line-color': '#1e40af',
          'line-width': 3
        }
      });

      // project polygons source
      m.addSource("projects-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      // fill layer for project polygons
      m.addLayer({
        id: "projects-fill",
        type: "fill",
        source: "projects-source",
        paint: {
          "fill-color": "#fff6a0",
          "fill-opacity": 0.7,
        }
      });

      // outline
      m.addLayer({
        id: "projects-line",
        type: "line",
        source: "projects-source",
        paint: {
          "line-color": "#cabf00",
          "line-width": 3
        }
      });

      // click handler
      m.on("click", "projects-fill", (e) => {
        const p = e.features?.[0].properties;
        if (!p) return;

        // convert stringified JSON geometry if needed
        const clickedProject = JSON.parse(JSON.stringify(p));
        // store selected project
        // you may need useState: const [selectedProject, setSelectedProject]
        setSelectedProject(clickedProject);
      });

      m.on("mouseenter", "projects-fill", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "projects-fill", () => {
        m.getCanvas().style.cursor = "";
      });


      loadAllTerritoryPoints();
      addMapClickListener();
      // getUnderServedAreas();
    });

    // controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'top-right'
    );
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('moveend', () => {
      const m = map.current!;
      const c = m.getCenter();
      dispatch(setCenter([+c.lng.toFixed(6), +c.lat.toFixed(6)]));
      dispatch(setZoom(+m.getZoom().toFixed(2)));
    });
  }, [dispatch, mapStyle]);

  // -------------------------------------------
  // SINGLE SELECTION
  // -------------------------------------------
  const addMapClickListener = () => {
    const m = map.current;
    if (!m) return;

    m.on('click', async (e) => {
      setLoading(true);

      try {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        const territory = await getTerritoryByLatLng(lng, lat);
        handleTerritorySelect(territory);
      } finally {
        setLoading(false);
      }
    });

  };

  const plotPolygon = (geometry: any) => {
    const m = map.current;
    if (!m || !geometry) return;
    console.log('geometry', geometry);
    const src = m.getSource('selected-territory') as maplibregl.GeoJSONSource;
    src.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry, properties: {} }]
    });

    const bounds = new maplibregl.LngLatBounds();
    geometry.coordinates[0].forEach(([lng, lat]) => bounds.extend([lng, lat]));
    m.fitBounds(bounds, { padding: 40, duration: 500 });
    setDrawerOpen(true);
  };

  const handleFullscreen = () => { const el = mapContainer.current; if (!el) return; if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen(); };

  const clearPolygon = () => {
    const m = map.current;
    if (!m) return;

    const src = m.getSource('selected-territory');
    if (!src) return;   // prevents crash

    (src as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: []
    });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('lastActivePath');
    localStorage.removeItem('tabOpenStates');
    navigation('/login');
  };

  // style changes applied instantly
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyles[mapStyle]?.url);
  }, [mapStyle]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();


  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await searchTerritory(query);
      if (response && response.length > 0) {
        setSearchResults(response || []);
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      alert('Failed to fetch location. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 right-5 z-40">
        <ProfileMenu userInfo={userInfo} handleLogout={handleLogout} />
      </div>

      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-5 z-20  px-6 flex gap-2 ">
        <div className='w-fit md:w-[400px]'>
          <Searchinput onSearch={handleSearch} /><GlobalLoader active={loading} />
          {
            searchResults.length > 0 && (<div className='mt-2 z-40 max-h-60 overflow-y-auto bg-white rounded-md shadow-lg border'>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'
                  onClick={async () => {
                    setLoading(true);
                    const territory = await getTerritoryByLatLng(result.center.coordinates[0], result.center.coordinates[1]);
                    handleTerritorySelect(territory);
                    setLoading(false);
                  }}
                >
                  <MapPin />  {result.name}, {result.city}
                </div>
              ))}
            </div>
            )
          }
        </div>
      </div>
      <div className='absolute top-16 md:top-4  left-[10%] md:left-[33%] w-full max-w-xs px-4 flex gap-2 '>
      </div>
      {/* Layer Switcher */}
      {/* <div className="absolute bottom-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => dispatch(toggleLayerMenu())}
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            aria-expanded={showLayerMenu}
            aria-controls="layer-menu"
          >
            <Layers size={20} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Layers</span>
          </Button>

          {showLayerMenu && (
            <div
              id="layer-menu"
              role="menu"
              className="absolute bottom-14 right-0 w-72 bg-white rounded-lg shadow-2xl p-3 ring-1 ring-black/5 mt-2"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">Map styles</span>
                </div>
                <button
                  aria-label="Close layer menu"
                  onClick={() => dispatch(setLayerMenu(false))}
                  className="text-gray-400 hover:text-gray-600 rounded-md p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {Object.entries(mapStyles).map(([key, style]) => {
                  const thumbStyle: React.CSSProperties =
                    key === 'streets'
                      ? { background: 'linear-gradient(135deg,#f8fafc,#dbeafe)' }
                      : key === 'satellite'
                        ? { background: 'linear-gradient(135deg,#e6f4ff,#d1fae5)' }
                        : { background: 'linear-gradient(135deg,#fff7ed,#fef3c7)' };

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        dispatch(setStyle(key));
                        dispatch(setLayerMenu(false));
                      }}
                      role="menuitem"
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors w-full text-left ${mapStyle === key ? 'ring-1 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="w-16 h-10 rounded-md overflow-hidden flex-shrink-0 border" style={thumbStyle} aria-hidden />
                      <div className="flex-1">
                        <div className={`text-sm ${mapStyle === key ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                          {style.name}
                        </div>
                        <div className="text-xs text-gray-500">{key}</div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {mapStyle === key ? (
                          <span className="text-blue-600 font-bold">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-200 block" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-gray-500">Tip: select a style to apply it instantly.</div>
            </div>
          )}
        </div>
      </div> */}

      {/* Zoom Controls */}
      <div className="absolute bottom-32 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <ZoomOut size={20} className="text-gray-700" />
        </button>
      </div>
      Hello
      <button
        onClick={handleLocateUser}
        className="absolute bottom-7 right-4 z-[100000] bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        <LocateFixedIcon size={20} />
      </button>
      {/* Fullscreen Button */}
      <button onClick={handleFullscreen} className="absolute bottom-20 right-4 z-10 bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
        <Maximize2 size={20} className="text-gray-700" />
      </button>

      <CustomDrawer open={openSidebar} onOpenChange={setOpenSidebar} handleSearch={handleSearch} direction="left">
        <div>
          <h1>Side Bar</h1>
        </div>
      </CustomDrawer>
      <CustomDrawer open={drawerOpen} onOpenChange={handleDrawerState} handleSearch={handleSearch} direction="left">
        <div>
          <ViewTerritories territory={territory} project={selectedProject} />
        </div>
      </CustomDrawer>

      {/* <CustomDrawer open={showTerritories} onOpenChange={setShowTerritories} handleSearch={handleSearch} direction="left">
        <div >
         <ViewTerritories/>
        </div>
      </CustomDrawer> */}

    </div>

  )
}

export default BaseMap;

