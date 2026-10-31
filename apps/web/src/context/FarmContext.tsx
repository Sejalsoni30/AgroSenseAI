import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface Zone {
  _id: string;
  farmId: string;
  name: string;
  soilType: 'sandy' | 'sandy_loam' | 'loam' | 'clay_loam' | 'silty_clay' | 'clay';
  cropName: string;
  growthStage: 'initial' | 'development' | 'mid' | 'late';
  areaHa: number;
  rootDepthM: number;
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'furrow';
  sensorId?: string;
  isDemo: boolean;
}

export interface Farm {
  _id: string;
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    altitudeM: number;
  };
  totalAreaHa: number;
  isDemo: boolean;
}

interface FarmContextType {
  farms: Farm[];
  activeFarm: Farm | null;
  zones: Zone[];
  activeZone: Zone | null;
  isLoading: boolean;
  setActiveFarm: (farm: Farm) => void;
  setActiveZone: (zone: Zone) => void;
  refreshFarms: () => Promise<void>;
  refreshZones: (farmId: string) => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshFarms = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await axios.get('/api/farms');
      const farmList: Farm[] = res.data.farms || [];
      setFarms(farmList);
      if (farmList.length > 0) {
        // Keep active or set first
        const selected = activeFarm ? farmList.find(f => f._id === activeFarm._id) || farmList[0] : farmList[0];
        setActiveFarm(selected);
        await refreshZones(selected._id);
      } else {
        setActiveFarm(null);
        setZones([]);
        setActiveZone(null);
      }
    } catch (err) {
      console.error('Failed to load farms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshZones = async (farmId: string) => {
    try {
      const res = await axios.get(`/api/farms/${farmId}`);
      const zoneList: Zone[] = res.data.zones || [];
      setZones(zoneList);
      if (zoneList.length > 0) {
        const selectedZone = activeZone ? zoneList.find(z => z._id === activeZone._id) || zoneList[0] : zoneList[0];
        setActiveZone(selectedZone);
      } else {
        setActiveZone(null);
      }
    } catch (err) {
      console.error('Failed to load zones for farm:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshFarms();
    } else {
      setFarms([]);
      setActiveFarm(null);
      setZones([]);
      setActiveZone(null);
    }
  }, [user]);

  const handleSelectFarm = (farm: Farm) => {
    setActiveFarm(farm);
    refreshZones(farm._id);
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        zones,
        activeZone,
        isLoading,
        setActiveFarm: handleSelectFarm,
        setActiveZone,
        refreshFarms,
        refreshZones
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

