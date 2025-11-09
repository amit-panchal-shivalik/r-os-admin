import {
  Paper,
  Text,
  Badge,
  Tabs,
  Group,
  Skeleton,
  Modal,
  ScrollArea,
  Image,
} from "@mantine/core";
import { PageHeader } from "@/components/ui/PageHeader";
import MapView from "@/components/maps/MapView";
import {
  PolygonF as Polygon,
  PolylineF as Polyline,
  OverlayView,
  MarkerF as Marker,
} from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  fetchTerritoryOverview,
  fetchTerritoryNews,
} from "@/apis/territoryService";
import { TerritoryFeature, TerritoryOverview } from "@/types/ApiTypes";
import { DEFAULT_TERRITORY_ID } from "@/utils/Constant";
import { useTerritorySelection } from "@/context/TerritoryContext";
import { getNewsApi } from "@/apis/dashboardService";

type NewsType = "Breaking" | "Recent" | "Update" | "Alert";

type SentimentType = "Positive" | "Negative" | "Neutral";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  type?: NewsType;
  time?: string;
  sentiment?: SentimentType;
  sentimentReason?: string;
  url?: string; // image or content url from API
};

const typeToColor: Record<NewsType, string> = {
  Breaking: "red",
  Recent: "blue",
  Update: "grape",
  Alert: "yellow",
};

const sentimentToColor: Record<SentimentType, string> = {
  Positive: "green",
  Negative: "red",
  Neutral: "blue",
};

type PropertyItem = {
  id: string;
  name: string;
  type: "Apartment" | "Villa" | "Plot" | "Office";
  price: string;
  location: string;
  status: "Available" | "Booked" | "Under Review";
};

type PulseItem = {
  id: string;
  title: string;
  details: string;
  reactions: { likes: number; comments: number };
};

type JobItem = {
  id: string;
  title: string;
  employer: string;
  location: string;
  pay: string;
  type: "Full-time" | "Part-time" | "Contract";
};

type OpportunityItem = {
  id: string;
  title: string;
  kind:
    | "Buyer Requirement"
    | "Rental Requirement"
    | "Land Parcel"
    | "Joint Development";
  budget?: string;
  summary: string;
};

const PROPERTIES: PropertyItem[] = [
  {
    id: "p1",
    name: "Emerald Heights",
    type: "Apartment",
    price: "₹ 45L-95L",
    location: "Ambli, Ahmedabad",
    status: "Available",
  },
  {
    id: "p2",
    name: "Riverside Residency",
    type: "Apartment",
    price: "₹ 35L-70L",
    location: "Vastrapur, Ahmedabad",
    status: "Booked",
  },
  {
    id: "p3",
    name: "Sunset Meadows",
    type: "Villa",
    price: "₹ 1.2Cr-2.4Cr",
    location: "Shilaj, Ahmedabad",
    status: "Under Review",
  },
];

const JOBS: JobItem[] = [
  {
    id: "j1",
    title: "Site Supervisor",
    employer: "Shivalik Projects",
    location: "Shela",
    pay: "₹18k-25k",
    type: "Full-time",
  },
  {
    id: "j2",
    title: "Electrician",
    employer: "Prime Utilities",
    location: "Bopal",
    pay: "₹15k-22k",
    type: "Contract",
  },
  {
    id: "j3",
    title: "Security Staff",
    employer: "SafeGuard",
    location: "Thaltej",
    pay: "₹12k-16k",
    type: "Part-time",
  },
];

const OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "o1",
    title: "Corporate rental requirement",
    kind: "Rental Requirement",
    budget: "â‚¹ 8L/yr",
    summary: "10 furnished flats near SG Highway.",
  },
  {
    id: "o2",
    title: "Land parcel JV",
    kind: "Joint Development",
    budget: "â€”",
    summary: "8-acre parcel near SP Ring Road for JV.",
  },
  {
    id: "o3",
    title: "Bulk buyer inquiry",
    kind: "Buyer Requirement",
    budget: "â‚¹ 5Cr",
    summary: "Investor seeking 20 apartments in single tower.",
  },
];

type BackendPolygon = {
  type: "Polygon";
  coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
};

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad default

export const TerritoryDashboardPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<Array<{
    lat: number;
    lng: number;
  }> | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isHover, setIsHover] = useState(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [placeLabels, setPlaceLabels] = useState<
    Array<{
      id: string;
      name: string;
      position: { lat: number; lng: number };
      viewport?: {
        ne: { lat: number; lng: number };
        sw: { lat: number; lng: number };
      };
    }>
  >([]);
  const [overviewData, setOverviewData] = useState<TerritoryOverview | null>(
    null
  );
  // ✅ Backend polygon state
  const [backendPolygon, setBackendPolygon] = useState<BackendPolygon | null>(
    null
  );
  // Google Map reference
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // ✅ Fetch your polygon from backend (simulate API)
  useEffect(() => {
    async function fetchPolygon() {
      // Replace this with axios fetch
      const apiData: BackendPolygon = {
        type: "Polygon",
        coordinates: [
          [
            [72.6479464, 22.9978414],
            [72.6474424, 22.9983784],
            [72.6471644, 22.9975604],
            [72.6471454, 22.9975054],
            [72.6479464, 22.9978414], // close polygon
          ],
        ],
      };

      setBackendPolygon(apiData);
    }

    fetchPolygon();
  }, []);

  // ✅ When backend polygon (dummy) is present, convert to path for <Polygon/>
  useEffect(() => {
    if (!backendPolygon) return;
    const outerRing = backendPolygon.coordinates[0];
    const converted = outerRing.map(([lng, lat]) => ({ lat, lng }));
    setSelectedPath(converted);
  }, [backendPolygon]);

  // ✅ When overviewData arrives, convert its geometry to a path
  useEffect(() => {
    if (!overviewData?.geometry?.coordinates?.[0]) return;
    const convert = overviewData.geometry.coordinates[0].map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );
    setSelectedPath(convert);
  }, [overviewData]);

  const { territories, selectedTerritory } = useTerritorySelection();
  const territoryFeatures = useMemo(
    () => territories.map((t) => t.feature),
    [territories]
  );
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const territoryId = selectedTerritory?.id ?? DEFAULT_TERRITORY_ID;

  useEffect(() => {
    let active = true;
    setDataLoading(true);
    fetchTerritoryOverview(territoryId)
      .then((overview) => {
        if (!active) return;
        setOverviewData(overview);
        setDataError(null);
      })
      .catch((error) => {
        if (!active) return;
        // Suppress generic 404s as "no data yet" rather than an error banner
        if ((error as any)?.status === 404) {
          setOverviewData(null);
          setDataError(null);
        } else {
          setDataError(error.message || "Failed to load territory overview");
        }
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, [territoryId]);

  const snapshot = overviewData?.snapshot ?? {};
  const totalTerritories = territoryFeatures.length;

  // News state
  const [place, setPlace] = useState<string>("ahmedabad");
  const [newsLoading, setNewsLoading] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // derive default place from selected territory name
  useEffect(() => {
    const name = selectedTerritory?.name?.trim();
    if (name && name !== place) setPlace(name);
  }, [selectedTerritory?.name]);

  // fetch news whenever place changes
  useEffect(() => {
    const fetchNews = async (p: string) => {
      const safe = (
        p?.trim() ||
        selectedTerritory?.name ||
        "Ahmedabad"
      ).toLowerCase();
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await getNewsApi(safe);
        const list = Array.isArray(res?.articles) ? res.articles : [];
        const mapped: NewsItem[] = list.map((n: any, idx: number) => {
          const rawSent = String(
            n.sentiment || n.sentiment_label || n.polarity || ""
          ).toLowerCase();
          let sentiment: SentimentType | undefined = undefined;
          if (rawSent.includes("pos")) sentiment = "Positive";
          else if (rawSent.includes("neg")) sentiment = "Negative";
          else if (rawSent) sentiment = "Neutral";
          return {
            id: n.id || `n-${idx}`,
            title: n.title || "Update",
            summary: n.summary || "",
            type: n.type as NewsType | undefined,
            time: n.time as string | undefined,
            sentiment,
            sentimentReason:
              n.sentiment_reason || n.reason || n.sentimentReason,
            url: n.url,
          };
        });
        setNewsItems(mapped);
      } catch (e: any) {
        setNewsError(e?.message || "Failed to fetch news");
        setNewsItems([]);
      } finally {
        setNewsLoading(false);
      }
    };
    if (place) fetchNews(place);
  }, [place]);
  const ensureGeocoder = () => {
    if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
    return geocoderRef.current as google.maps.Geocoder;
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("latlng", latlng);
    }
    setMarkerPosition(latlng);
    // Do not highlight or geocode on simple map clicks â€” marker only
  };

  const centroid = useMemo(() => {
    if (!selectedPath || selectedPath.length === 0)
      return null as { lat: number; lng: number } | null;
    const sum = selectedPath.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: sum.lat / selectedPath.length,
      lng: sum.lng / selectedPath.length,
    };
  }, [selectedPath]);

  const handleAreaClick = () => {};

  return (
    <div className="mt-5">
      <PageHeader
        title="Territory Dashboard"
        description="Overview and quick stats"
      />
      <Paper p="md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Map */}
          <div className="space-y-3">
            <Text size="sm" c="dimmed">
              Territory Map
            </Text>
            <div className="border rounded-lg overflow-hidden">
              {/* <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={(mapRef) => setMap(mapRef)}
              /> */}
              <MapView
                heightClassName="h-[45vh] md:h-[520px]"
                onLoad={(m) => {
                  mapRef.current = m;
                  setMap(m);
                }}
                onClick={handleMapClick}
              >
                {/* Hoverable custom labels (styled) */}
                {placeLabels.map((pl) => (
                  <OverlayView
                    key={pl.id}
                    position={pl.position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      className={
                        "text-xs px-2 py-1 rounded-md bg-white/90 border shadow-sm cursor-pointer " +
                        (isHover
                          ? "text-blue-600 font-semibold"
                          : "text-gray-800")
                      }
                      onMouseEnter={() => {
                        setIsHover(true);
                        if (mapRef.current)
                          mapRef.current.getDiv().style.cursor = "pointer";
                      }}
                      onMouseLeave={() => {
                        setIsHover(false);
                        if (mapRef.current)
                          mapRef.current.getDiv().style.cursor = "default";
                      }}
                      onClick={() => {
                        if (!pl.viewport || !mapRef.current) return;
                        const g = (window as any).google?.maps;
                        if (!g) return;
                        const { ne, sw } = pl.viewport;
                        const nw = { lat: ne.lat, lng: sw.lng };
                        const se = { lat: sw.lat, lng: ne.lng };
                        const path = [nw, ne, se, sw];
                        setSelectedPath(path);
                        setSelectedName(pl.name);
                        const b = new g.LatLngBounds();
                        b.extend(new g.LatLng(ne.lat, ne.lng));
                        b.extend(new g.LatLng(sw.lat, sw.lng));
                        mapRef.current.fitBounds(b, 50);
                      }}
                    >
                      {pl.name}
                    </div>
                  </OverlayView>
                ))}
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    draggable
                    onDragEnd={(ev) => {
                      if (!ev.latLng) return;
                      const next = {
                        lat: ev.latLng.lat(),
                        lng: ev.latLng.lng(),
                      };
                      setMarkerPosition(next);
                    }}
                  />
                )}

                {selectedPath && (
                  <>
                    <Polygon
                      paths={selectedPath}
                      options={{
                        fillColor: "#3b82f6",
                        fillOpacity: isHover ? 0.14 : 0.08,
                        strokeColor: "#3b82f6",
                        strokeOpacity: isHover ? 0.6 : 0.3,
                        strokeWeight: isHover ? 3 : 2,
                        clickable: true,
                      }}
                      onMouseOver={() => {
                        setIsHover(true);
                        if (mapRef.current)
                          mapRef.current.getDiv().style.cursor = "pointer";
                      }}
                      onMouseOut={() => {
                        setIsHover(false);
                        if (mapRef.current)
                          mapRef.current.getDiv().style.cursor = "default";
                      }}
                    />
                    {typeof window !== "undefined" &&
                    (window as any).google?.maps?.SymbolPath?.CIRCLE ? (
                      <Polyline
                        path={[...selectedPath, selectedPath[0]]}
                        options={{
                          strokeOpacity: 0,
                          icons: [
                            {
                              icon: {
                                path: (window as any).google.maps.SymbolPath
                                  .CIRCLE,
                                scale: 2,
                                strokeOpacity: 1,
                              },
                              offset: "0",
                              repeat: "12px",
                            },
                          ],
                        }}
                      />
                    ) : null}
                  </>
                )}
              </MapView>
              {selectedName && (
                <div className="mt-2">
                  <Badge
                    variant="light"
                    color={isHover ? "blue" : "gray"}
                    className={isHover ? "cursor-pointer" : ""}
                  >
                    {selectedName}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Right: Tabbed content */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <Text size="xs" c="dimmed">
                  Territory overview
                </Text>
                <Text fw={600}>
                  {overviewData?.name || "Primary Territory"}
                </Text>
                {overviewData?.pin_code && (
                  <Text size="xs" c="dimmed">
                    Pin code {overviewData.pin_code}
                  </Text>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatsCard
                  title="Active Projects"
                  value={snapshot.active_projects ?? 0}
                  size="mini"
                />
                <StatsCard
                  title="Registered Professionals"
                  value={snapshot.registered_professionals ?? 0}
                  size="mini"
                />
                <StatsCard
                  title="Hot Leads"
                  value={snapshot.hot_leads ?? 0}
                  size="mini"
                />
                <StatsCard
                  title="Local Pulses"
                  value={snapshot.local_pulses ?? 0}
                  size="mini"
                />
              </div>
              <Text size="xs" c="dimmed">
                {totalTerritories} territory polygon
                {totalTerritories === 1 ? "" : "s"} loaded.
              </Text>
              {dataLoading && (
                <Text size="xs" c="dimmed">
                  Refreshing territory statsâ€¦
                </Text>
              )}
              {dataError && (
                <Text size="xs" c="red">
                  {dataError}
                </Text>
              )}
            </div>
            <Tabs defaultValue="news" keepMounted={false} className="w-full">
              <Tabs.List>
                <Tabs.Tab value="news">News Feed</Tabs.Tab>
                <Tabs.Tab value="property">Property</Tabs.Tab>
                {/* <Tabs.Tab value="pulses">Pulses</Tabs.Tab> */}
                <Tabs.Tab value="jobs">Blue Collar Jobs</Tabs.Tab>
                <Tabs.Tab value="opportunities">Opportunities</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="news" pt="sm">
                <div className="border rounded-lg p-3 md:p-4 max-h-[520px] overflow-y-auto no-scrollbar">
                  <div className="flex flex-col gap-3">
                    {newsLoading ? (
                      <>
                        <Skeleton height={72} radius="md" />
                        <Skeleton height={72} radius="md" />
                        <Skeleton height={72} radius="md" />
                      </>
                    ) : newsError ? (
                      <Text size="sm" c="red">
                        {newsError}
                      </Text>
                    ) : newsItems.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        No news available.
                      </Text>
                    ) : (
                      newsItems?.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                          // onMouseEnter={() => handleAreaHover(item.title)}
                          onClick={() => {
                            handleAreaClick(item.title);
                            setSelectedNews(item);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {item.sentiment && (
                                <div className="mb-1 flex items-center gap-2 flex-wrap">
                                  <Badge
                                    color={sentimentToColor[item.sentiment]}
                                    variant="light"
                                  >
                                    {item.sentiment}
                                  </Badge>
                                  {item.sentimentReason && (
                                    <Badge variant="outline" color="gray">
                                      {item.sentimentReason}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <Text fw={600} className="mr-2">
                                {item.title}
                              </Text>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.type && (
                                <Badge
                                  color={typeToColor[item.type]}
                                  variant="light"
                                >
                                  {item.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {item.summary && (
                            <Text size="sm" c="dimmed" className="mt-1">
                              {item.summary}
                            </Text>
                          )}
                          {item.time && (
                            <Text size="xs" c="dimmed" className="mt-2">
                              {item.time}
                            </Text>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Tabs.Panel>

              {/* News details modal */}
              <Modal
                opened={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                size="xl"
                centered
                title={
                  selectedNews ? (
                    <Text fw={700}>{selectedNews.title}</Text>
                  ) : undefined
                }
              >
                {selectedNews && (
                  <ScrollArea.Autosize
                    mah={"70vh"}
                    className="pr-1"
                    style={{ overflowX: "hidden" }}
                  >
                    <div className="space-y-3 break-words whitespace-normal">
                      {(selectedNews.sentiment || selectedNews.type) && (
                        <Group gap={8}>
                          {selectedNews.sentiment && (
                            <Badge
                              color={sentimentToColor[selectedNews.sentiment]}
                              variant="light"
                            >
                              {selectedNews.sentiment}
                            </Badge>
                          )}
                          {selectedNews.sentimentReason && (
                            <Badge variant="outline" color="gray">
                              {selectedNews.sentimentReason}
                            </Badge>
                          )}
                          {selectedNews.type && (
                            <Badge
                              variant="light"
                              color={typeToColor[selectedNews.type]}
                            >
                              {selectedNews.type}
                            </Badge>
                          )}
                        </Group>
                      )}
                      {selectedNews.url && (
                        <Text size="sm" style={{ wordBreak: "break-word" }}>
                          Source:{" "}
                          <a
                            href={selectedNews.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 text-wrap"
                          >
                            {selectedNews.url}
                          </a>
                        </Text>
                      )}
                      {selectedNews.summary && (
                        <Text
                          size="sm"
                          className="break-words whitespace-normal"
                        >
                          {selectedNews.summary}
                        </Text>
                      )}
                      {selectedNews.time && (
                        <Text size="xs" c="dimmed">
                          {selectedNews.time}
                        </Text>
                      )}
                    </div>
                  </ScrollArea.Autosize>
                )}
              </Modal>
              {/* Property Tab */}
              <Tabs.Panel value="property" pt="sm">
                <div className="border rounded-lg p-3 md:p-4 max-h-[520px] overflow-y-auto no-scrollbar">
                  {/** currency/char fixes for display only */}
                  {/** simple formatter to normalize mojibake to ₹ and em dash */}
                  {/** local helpers */}
                  {/**/}
                  <div className="grid grid-cols-1 gap-3">
                    {PROPERTIES.map((p) => {
                      const fmt = (s: string) =>
                        (s || "").replace(/â‚¹/g, "₹").replace(/â€”/g, "—");
                      return (
                        <div
                          key={p.id}
                          className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate('/territory/project')}
                          role="button"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Text fw={600} className="leading-tight">
                              {p.name}
                            </Text>
                            <Badge variant="light">{p.type}</Badge>
                          </div>
                          <Text size="sm" c="dimmed" className="mt-1">
                            {p.location}
                          </Text>
                          <div className="mt-2 flex items-center justify-between">
                            <Text size="sm">{fmt(p.price)}</Text>
                            <Badge
                              color={
                                p.status === "Available"
                                  ? "green"
                                  : p.status === "Booked"
                                  ? "yellow"
                                  : "gray"
                              }
                              variant="light"
                            >
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Tabs.Panel>

              {/* Blue Collar Jobs Tab */}
              <Tabs.Panel value="jobs" pt="sm">
                <div className="border rounded-lg p-3 md:p-4 max-h-[520px] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 gap-3">
                    {JOBS.map((j) => {
                      const fmt = (s: string) => (s || "").replace(/â‚¹/g, "₹");
                      return (
                        <div
                          key={j.id}
                          className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate('/territory/blue-collar-job')}
                          role="button"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Text fw={600}>{j.title}</Text>
                            <Badge variant="light">{j.type}</Badge>
                          </div>
                          <Text size="sm" c="dimmed">
                            {j.employer} · {j.location}
                          </Text>
                          <Text size="sm" className="mt-1">
                            {fmt(j.pay)}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Tabs.Panel>

              {/* Opportunities Tab */}
              <Tabs.Panel value="opportunities" pt="sm">
                <div className="border rounded-lg p-3 md:p-4 max-h-[520px] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 gap-3">
                    {OPPORTUNITIES.map((o) => {
                      const fmt = (s?: string) =>
                        (s || "").replace(/â‚¹/g, "₹").replace(/â€”/g, "—");
                      return (
                        <div
                          key={o.id}
                          className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate('/territory/opportunity')}
                          role="button"
                        >
                          <Text fw={600} className="leading-tight">
                            {o.title}
                          </Text>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <Badge variant="light">{o.kind}</Badge>
                            {o.budget && (
                              <Badge variant="outline">{fmt(o.budget)}</Badge>
                            )}
                          </div>
                          <Text size="sm" c="dimmed" className="mt-1">
                            {o.summary}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default TerritoryDashboardPage;
