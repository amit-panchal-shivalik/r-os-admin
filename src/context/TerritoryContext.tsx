import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchTerritoryMapData } from "@/apis/territoryService";
import { TerritoryFeature } from "@/types/ApiTypes";

export interface TerritoryOption {
  id: string;
  name: string;
  feature: TerritoryFeature;
}

interface TerritoryContextValue {
  territories: TerritoryOption[];
  selectedTerritory: TerritoryOption | null;
  selectTerritory: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = "selected_territory_id";

const TerritoryContext = createContext<TerritoryContextValue | undefined>(
  undefined
);

const getFeatureId = (feature: TerritoryFeature, index: number) => {
  const candidate =
    feature.properties?.territory_id ||
    feature.properties?.territoryId ||
    feature.properties?.id ||
    feature.properties?.territory?.territory_id ||
    `${index + 1}`;
  return String(candidate);
};

const getFeatureName = (feature: TerritoryFeature, index: number) => {
  return (
    feature.properties?.name ||
    feature.properties?.territory_name ||
    feature.properties?.title ||
    `Territory ${index + 1}`
  );
};

export const TerritoryProvider = ({ children }: { children: ReactNode }) => {
  const [territories, setTerritories] = useState<TerritoryOption[]>([]);
  // const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>(() =>
  //   localStorage.getItem(STORAGE_KEY) ?? ''
  // );
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchTerritoryMapData()
      .then((data) => {
        if (!active) return;
        const mapped = data.features
          .map((feature, index) => ({
            id: getFeatureId(feature, index),
            name: getFeatureName(feature, index),
            feature,
          }))
          .filter((t) => Boolean(t.id));
        setTerritories(mapped);
        if (active) {
          const stored = localStorage.getItem(STORAGE_KEY);
          const found = stored ? mapped.find((t) => t.id === stored) : null;
          if (found) {
            setSelectedTerritoryId(found.id);
          } else if (mapped.length) {
            setSelectedTerritoryId(mapped[0].id);
            localStorage.setItem(STORAGE_KEY, mapped[0].id);
          }
        }
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Unable to load territories");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTerritoryId) return;
    localStorage.setItem(STORAGE_KEY, selectedTerritoryId);
  }, [selectedTerritoryId]);

  const selectTerritory = (id: string) => {
    setSelectedTerritoryId(id);
  };

  const selectedTerritory = (() => {
    if (selectedTerritoryId === 'all') {
      const allFeature: TerritoryFeature = {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] as any },
        properties: { name: 'All Territories' },
      } as TerritoryFeature;
      return { id: 'all', name: 'All Territories', feature: allFeature };
    }
    return (
      territories.find((t) => t.id === selectedTerritoryId) ??
      territories[0] ??
      null
    );
  })();

  // Log selected territory details including geometry so map can render exact boundaries
  useEffect(() => {
    if (!selectedTerritory) return;
    try {
      // eslint-disable-next-line no-console
      console.log("[Territory] Selected", {
        id: selectedTerritory.id,
        name: selectedTerritory.name,
        geometry: selectedTerritory.feature?.geometry,
      });
    } catch {}
  }, [selectedTerritory]);

  return (
    <TerritoryContext.Provider
      value={{
        territories,
        selectedTerritory,
        selectTerritory,
        loading,
        error,
      }}
    >
      {children}
    </TerritoryContext.Provider>
  );
};

export const useTerritorySelection = () => {
  const context = useContext(TerritoryContext);
  if (!context) {
    throw new Error(
      "useTerritorySelection must be used within TerritoryProvider"
    );
  }
  return context;
};
