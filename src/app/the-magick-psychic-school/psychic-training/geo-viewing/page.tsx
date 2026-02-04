"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Loader2, Zap, Timer, MapPin, Eye, Trophy, RefreshCw, Compass, 
  Search, Globe, AlertCircle, MousePointer2, ExternalLink, X, 
  BarChart3, Target, Crosshair, Plus, Minus, Camera, Landmark, Mountain, Building2, History, Dices, ChevronLeft, Map as MapIcon, ArrowRight
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- CONFIGURATION & LIBRARY ---
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""; 

const TARGET_LIBRARY: Record<string, { name: string; lat: number; lng: number; region: string }[]> = {
  ANCIENT: [
    { name: "Great Pyramid of Giza", lat: 29.9792, lng: 31.1342, region: "Egypt" },
    { name: "Stonehenge", lat: 51.1789, lng: -1.8262, region: "UK" },
    { name: "Machu Picchu", lat: -13.1631, lng: -72.5450, region: "Peru" },
    { name: "Easter Island Moai", lat: -27.1127, lng: -109.3497, region: "Chile" },
    { name: "The Colosseum", lat: 41.8902, lng: 12.4922, region: "Italy" },
    { name: "Angkor Wat", lat: 13.4125, lng: 103.8670, region: "Cambodia" }
  ],
  ARCHITECTURAL: [
    { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, region: "France" },
    { name: "Taj Mahal", lat: 27.1751, lng: 78.0421, region: "India" },
    { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, region: "UAE" },
    { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, region: "Australia" },
    { name: "Empire State Building", lat: 40.7484, lng: -73.9857, region: "USA" }
  ],
  NATURAL: [
    { name: "Mount Everest", lat: 27.9881, lng: 86.9250, region: "Nepal" },
    { name: "Grand Canyon", lat: 36.1070, lng: -112.1130, region: "USA" },
    { name: "Victoria Falls", lat: -17.9243, lng: 25.8572, region: "Zambia/Zimbabwe" },
    { name: "Mount Fuji", lat: 35.3606, lng: 138.7274, region: "Japan" },
    { name: "Great Barrier Reef", lat: -18.2871, lng: 147.6992, region: "Australia" }
  ],
  URBAN: [
    { name: "Times Square", lat: 40.7580, lng: -73.9855, region: "USA" },
    { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, region: "Japan" },
    { name: "Piccadilly Circus", lat: 51.5101, lng: -0.1342, region: "UK" },
    { name: "Red Square", lat: 55.7539, lng: 37.6208, region: "Russia" },
    { name: "Copacabana Beach", lat: -22.9714, lng: -43.1823, region: "Brazil" }
  ]
};

const CATEGORIES = [
  { id: 'ANCIENT', label: 'Ancient Wonders', icon: History, color: 'text-amber-400', desc: 'Ancient Resonance' },
  { id: 'ARCHITECTURAL', label: 'Architecture', icon: Landmark, color: 'text-blue-400', desc: 'Monumental Intent' },
  { id: 'NATURAL', label: 'Nature', icon: Mountain, color: 'text-emerald-400', desc: 'Geological Spikes' },
  { id: 'URBAN', label: 'Urban Centers', icon: Building2, color: 'text-purple-400', desc: 'Human Clusters' },
  { id: 'RANDOM', label: 'Total Flux', icon: Dices, color: 'text-slate-400', desc: 'Atmospheric Variance' }
];

const BLIND_STYLE = [
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "water", stylers: [{ color: "#bfdbfe" }] }, // Light Blue (Blue-200)
  { featureType: "landscape", stylers: [{ color: "#f8fafc" }] } // White/Slate-50
];

const REVEALED_STYLE = [
  { elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "administrative", stylers: [{ visibility: "on" }] },
  { featureType: "water", stylers: [{ color: "#0f172a" }] },
  { featureType: "landscape", stylers: [{ color: "#1e293b" }] }
];

// Add strict types for Google Maps globals to avoid TS errors if not fully typed
declare global {
  interface Window {
    google: any;
  }
}

// --- SUB-COMPONENT: STREET VIEW PANEL ---
function StreetViewPanel({ coords, title, className, label }: { coords: { lat: number, lng: number }, title: string, className?: string, label?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!coords || !containerRef.current || !window.google || !window.google.maps) return;
    
    const sv = new window.google.maps.StreetViewService();
    // Standard Street View setup
    const pano = new window.google.maps.StreetViewPanorama(containerRef.current, {
        position: coords,
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        motionTracking: true,
        linksControl: false,
        panControl: true,
        enableCloseButton: false,
    });

    // Use a large radius to find *something* if exact coord has no view
    sv.getPanorama({ location: coords, radius: 500000 }, (data: any, status: any) => {
        if (status === "OK") {
            pano.setPano(data.location.pano);
        } else {
            console.warn(`Street View not found for ${title}`);
            setError(true);
        }
    });

  }, [coords, title]);

  return (
    <div className={`relative bg-black/50 overflow-hidden ${className}`}>
        {/* Label Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-linear-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
            <div>
                {label && <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">{label}</div>}
                <div className="text-xs font-bold text-white drop-shadow-md truncate max-w-[200px]">{title}</div>
            </div>
            <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/70">
                <Camera size={14} />
            </div>
        </div>

        {/* Panorama Container */}
        {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 border border-white/5">
                <Camera size={24} className="mb-2 opacity-50" />
                <span className="text-[10px] uppercase tracking-widest">No Visual Feed</span>
            </div>
        ) : (
            <div ref={containerRef} className="w-full h-full grayscale-[0.2]" />
        )}
    </div>
  );
}

export default function GeoViewingPage() {
  const [gameState, setGameState] = useState('CATEGORY_SELECT'); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<string | null>(null); 
  const [target, setTarget] = useState<{name: string, lat: number, lng: number, region: string} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [userPlaceName, setUserPlaceName] = useState("");
  const [rawCoords, setRawCoords] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  
  // Storing locations for the result view
  const [resultLocations, setResultLocations] = useState<{target: any, user: any} | null>(null);

  // Search State
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const mapRef = useRef<any>(null);
  const googleRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) {
        console.warn("Google Maps API Key missing");
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
        if (window.google && window.google.maps) {
            googleRef.current = window.google;
            geocoderRef.current = new window.google.maps.Geocoder();
            setLoading(false);
        }
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&v=weekly`;
    script.async = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        googleRef.current = window.google;
        geocoderRef.current = new window.google.maps.Geocoder();
        setLoading(false);
      }
    };
    script.onerror = () => {
        console.error("Failed to load Google Maps script");
        setLoading(false); // Let it load safely to show UI even if map fails
    }
    document.head.appendChild(script);
  }, []);

  // Initialize Places Service when map is ready
  useEffect(() => {
    if (mapRef.current && window.google && !placesRef.current) {
      placesRef.current = new window.google.maps.places.PlacesService(mapRef.current);
    }
  }, [loading, gameState]);

  const currentPool = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === 'RANDOM') return Object.values(TARGET_LIBRARY).flat();
    return TARGET_LIBRARY[selectedCategory] || [];
  }, [selectedCategory]);

  const handleZoom = (delta: number) => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + delta);
  };

  const handleLocationSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!locationSearch || !mapRef.current) return;
    
    setIsSearching(true);
    setSearchError("");

    // Check if input looks like coordinates: "lat, lng"
    const coordMatch = locationSearch.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setCenter({ lat, lng });
        mapRef.current.setZoom(12);
        setIsSearching(false);
        setLocationSearch("");
        return;
      }
    }
    
    // First attempt: Geocoder
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ address: locationSearch }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          setIsSearching(false);
          mapRef.current.setCenter(results[0].geometry.location);
          mapRef.current.setZoom(14);
          setLocationSearch("");
        } else if (placesRef.current) {
          // Second attempt: Places Service
          const request = { query: locationSearch, fields: ['name', 'geometry'] };
          placesRef.current.findPlaceFromQuery(request, (pResults: any, pStatus: any) => {
            setIsSearching(false);
            if (pStatus === 'OK' && pResults[0]) {
              mapRef.current.setCenter(pResults[0].geometry.location);
              mapRef.current.setZoom(14);
              setLocationSearch("");
            } else {
              setSearchError("API Service Restricted");
              setTimeout(() => setSearchError(""), 3000);
            }
          });
        } else {
            console.error("Geocoding failed: ", status);
            setIsSearching(false);
            setSearchError("Service Unavailable");
            setTimeout(() => setSearchError(""), 3000);
        }
      });
    } else {
        setIsSearching(false);
    }
  };

  const selectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setGameState('MODE_SELECT');
  };

  const startGame = (mode: string) => {
    setGameMode(mode);
    setGameState('TARGETING');
    setDistance(null);
    setUserPlaceName("");
    setRawCoords("");
    setLocationSearch("");
    setShowResultCard(false);
    setResultLocations(null);
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (mapRef.current) {
      mapRef.current.setOptions({ styles: BLIND_STYLE, center: { lat: 20, lng: 0 }, zoom: 2.5 });
    }

    if (mode === 'RETRO_SENSING') {
      const randomTarget = currentPool[Math.floor(Math.random() * currentPool.length)];
      setTarget(randomTarget);
    } else {
      setTarget(null);
    }
  };

  const handleConfirmLocation = () => {
    if (!mapRef.current || !googleRef.current || !currentPool.length) return;
    const latLng = mapRef.current.getCenter();
    let finalTarget = target;
    
    if (gameMode === 'PRECOGNITION') {
      finalTarget = currentPool[Math.floor(Math.random() * currentPool.length)];
      setTarget(finalTarget);
    }

    if (!finalTarget) return;

    const targetLatLng = new googleRef.current.maps.LatLng(finalTarget.lat, finalTarget.lng);
    const distMeters = googleRef.current.maps.geometry.spherical.computeDistanceBetween(latLng, targetLatLng);
    
    setDistance(distMeters * 0.000621371); // Miles
    setResultLocations({
        target: { lat: finalTarget.lat, lng: finalTarget.lng },
        user: { lat: latLng.lat(), lng: latLng.lng() }
    });
    setRawCoords(`${latLng.lat().toFixed(4)}, ${latLng.lng().toFixed(4)}`);
    setGameState('REVEALED');
    setShowResultCard(true);
    setIsGeocoding(true);

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: latLng }, (results: any, gStatus: any) => {
        setIsGeocoding(false);
        if (gStatus === "OK" && results[0]) {
          const comp = results[0].address_components;
          const country = comp.find((c: any) => c.types.includes("country"))?.long_name;
          const city = comp.find((c: any) => c.types.includes("locality") || c.types.includes("administrative_area_level_1") || c.types.includes("postal_town"))?.long_name;
          const landmark = comp.find((c: any) => c.types.includes("point_of_interest") || c.types.includes("establishment") || c.types.includes("neighborhood"))?.long_name;
          
          let parts = [];
          if (country) parts.push(country);
          if (city && city !== country) parts.push(city);
          if (landmark && landmark !== city && landmark !== country) parts.push(landmark);
          
          // Fallback if only country or nothing
          if (parts.length === 0) {
             // Check formatted address for non-plus code
             if (results[0].formatted_address && !results[0].formatted_address.includes('+')) {
                 parts.push(results[0].formatted_address);
             } else {
                 parts.push("Unknown Location");
             }
          }

          setUserPlaceName(parts.join(", "));
        } else {
          setUserPlaceName("Unknown Location");
        }
      });
    }

    mapRef.current.setOptions({ styles: REVEALED_STYLE });
    
    const userMarker = new googleRef.current.maps.Marker({
      position: latLng,
      map: mapRef.current,
      label: { text: "YOU", color: "white", fontWeight: "bold", fontSize: "14px", className: "map-label-you" }, 
      animation: googleRef.current.maps.Animation.DROP,
      cursor: 'pointer',
      icon: {
        path: googleRef.current.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#F43F5E",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF",
      }
    });
    
    const targetMarker = new googleRef.current.maps.Marker({
      position: targetLatLng,
      map: mapRef.current,
      icon: { path: googleRef.current.maps.SymbolPath.CIRCLE, scale: 14, fillColor: "#6366f1", fillOpacity: 1, strokeWeight: 4, strokeColor: "#ffffff" },
      cursor: 'pointer',
      label: { text: "TARGET", color: "#6366f1", fontWeight: "bold", fontSize: "14px", className: "map-label-target" }
    });
    
    markersRef.current = [userMarker, targetMarker];
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(latLng);
    bounds.extend(targetLatLng);
    mapRef.current.fitBounds(bounds, { top: 100, bottom: 250, left: 100, right: 100 });
  };

  const openInGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rawCoords) {
      window.open(`https://www.google.com/maps/search/${rawCoords}`, '_blank');
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[100dvh] items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Initializing Lab...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 font-sans text-slate-100 overflow-hidden select-none relative">
      
      {/* HEADER HUD */}
      <div className="flex-none h-14 md:h-16 px-4 bg-slate-950 border-b border-white/5 flex justify-between items-center z-50 shadow-2xl relative">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
              <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="" />
          </div>
          <div className="hidden md:block">
              <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Laboratorium" />
          </div>

          <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>

          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shrink-0">
            <Compass className="text-indigo-400 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[10px] md:text-sm font-black tracking-tighter bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent uppercase truncate">
              CVT: Geo Viewing
            </h1>
            {selectedCategory && (
              <p className="text-[7px] md:text-[9px] text-white font-black uppercase tracking-widest truncate flex items-center gap-1.5">
                <span className="text-indigo-500/80">FOCUS:</span> 
                {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </p>
            )}
          </div>
        </div>

        {gameState !== 'CATEGORY_SELECT' && (
          <div className="flex items-center gap-2">
             {gameState === 'REVEALED' && (
                <button 
                  onClick={() => startGame(gameMode!)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-black uppercase tracking-widest text-[8px] md:text-[9px] transition-all shadow-lg shrink-0"
                >
                  <ArrowRight size={10} />
                  <span>Next</span>
                </button>
             )}
             <button 
                onClick={() => setGameState('CATEGORY_SELECT')} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-black uppercase tracking-widest text-[8px] md:text-[9px] transition-all shadow-lg shrink-0 border border-white/5"
              >
                <RefreshCw size={10} />
                <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        <GoogleMapComponent onLoad={(map: any) => { mapRef.current = map; }} />

        {gameState === 'CATEGORY_SELECT' && (
          <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-sm overflow-y-auto px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Same Category Selector content */}
                <div className="text-center mb-8 space-y-2">
                <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-[0.3em] shadow-lg bg-slate-950/80 backdrop-blur-md">System Initialization</div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">Select Sensing Focus</h2>
                <p className="text-slate-200 text-[10px] md:text-xs drop-shadow-md font-bold">Calibrate perception to an atmospheric frequency.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className="group flex items-center gap-4 p-4 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-slate-800/90 hover:border-indigo-500/50 transition-all text-left shadow-2xl"
                  >
                    <div className={`p-3 bg-slate-950 rounded-lg ${cat.color} group-hover:scale-110 transition-transform shrink-0`}>
                      <cat.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-[11px] md:text-sm uppercase tracking-tight text-white">{cat.label}</div>
                      <div className="text-[8px] md:text-[10px] text-slate-500 mt-0.5 italic truncate">{cat.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'MODE_SELECT' && (
          <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-sm space-y-6">
                {/* Same Mode Selector Content */}
                <button onClick={() => setGameState('CATEGORY_SELECT')} className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-white uppercase font-black transition-colors">
                <ChevronLeft size={12} /> Back to Focus
              </button>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">Choose Strategy</h2>
                <p className="text-white text-[9px] uppercase font-bold tracking-widest pt-1 drop-shadow-md bg-black inline-block px-2 rounded-lg border border-white/20">
                  Focusing: {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </p>
              </div>
              <div className="grid gap-3">
                <button onClick={() => startGame('RETRO_SENSING')} className="group flex items-center gap-4 p-4 md:p-6 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all text-left shadow-2xl">
                  <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500 text-indigo-400 group-hover:text-white transition-all shrink-0"><Timer size={20} /></div>
                  <div className="min-w-0">
                    <div className="font-black text-xs md:text-sm text-white uppercase">Retro-Sensing</div>
                    <div className="text-[9px] text-slate-500 italic mt-0.5">Divine an existing target.</div>
                  </div>
                </button>
                <button onClick={() => startGame('PRECOGNITION')} className="group flex items-center gap-4 p-4 md:p-6 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all text-left shadow-2xl">
                  <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500 text-purple-400 group-hover:text-white transition-all shrink-0"><Zap size={20} /></div>
                  <div className="min-w-0">
                    <div className="font-black text-xs md:text-sm text-white uppercase">Precognition</div>
                    <div className="text-[9px] text-slate-500 italic mt-0.5">Divine the future manifest.</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TARGETING PHASE --- */}
        {gameState === 'TARGETING' && (
          <>
            <div className="absolute top-4 inset-x-0 z-30 flex justify-center px-4">
              <form 
                onSubmit={handleLocationSearch}
                className={`w-full max-w-sm flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 pl-4 rounded-xl border ${searchError ? 'border-red-500/50' : 'border-white/10'} shadow-2xl ring-1 ring-white/5 transition-all`}
              >
                <Search size={14} className={searchError ? "text-red-400" : "text-slate-500"} />
                <input 
                  type="text" 
                  value={searchError || locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Enter location or 'lat,lng'..."
                  className={`bg-transparent border-none focus:ring-0 text-[10px] md:text-xs placeholder-slate-600 flex-1 py-1 ${searchError ? 'text-red-400 font-bold uppercase' : 'text-white'}`}
                  disabled={isSearching}
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 shrink-0"
                >
                  {isSearching ? <Loader2 size={10} className="animate-spin" /> : 'Go'}
                </button>
              </form>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 md:w-20 md:h-20 border border-indigo-500/30 rounded-full animate-pulse" />
                <div className="absolute w-6 md:w-8 h-px bg-indigo-400/50" />
                <div className="absolute h-6 md:h-8 w-px bg-indigo-400/50" />
                <Crosshair className="text-indigo-400 w-4 h-4 md:w-5 md:h-5 animate-spin-slow opacity-60" />
              </div>
            </div>

            <div className="absolute bottom-24 md:bottom-8 inset-x-0 z-20 flex flex-col items-center gap-2 px-6 pointer-events-none">
              <button 
                onClick={handleConfirmLocation} 
                className="pointer-events-auto flex items-center gap-2 bg-white text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-2xl hover:bg-indigo-400 active:scale-95"
              >
                <Target size={14} />
                Lock Coordinate
              </button>
            </div>
          </>
        )}

        {/* --- MAP NAVIGATION --- */}
        {(gameState === 'TARGETING' || gameState === 'REVEALED') && (
          <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
            <button onClick={() => handleZoom(1)} className="p-2 bg-slate-900/90 border border-white/10 rounded-lg hover:bg-indigo-600 text-white shadow-xl active:scale-90 transition-colors"><Plus size={16} /></button>
            <button onClick={() => handleZoom(-1)} className="p-2 bg-slate-900/90 border border-white/10 rounded-lg hover:bg-indigo-600 text-white shadow-xl active:scale-90 transition-colors"><Minus size={16} /></button>
          </div>
        )}

        {/* --- REVEALED PHASE (RESULT CARD) --- */}
        {showResultCard && distance !== null && resultLocations && (
           <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 overflow-hidden">
                <div className="w-full h-full max-w-[1920px] mx-auto flex flex-col md:flex-row relative">
                    
                    {/* 1. LEFT COLUMN (TARGET 360) - DESKTOP ONLY */}
                    <div className="hidden md:block md:w-1/3 border-r border-white/10 relative h-full">
                        <StreetViewPanel coords={resultLocations.target} title={target?.name || "Target"} label="TARGET RESONANCE" className="h-full w-full" />
                    </div>

                    {/* 2. CENTER COLUMN (RESULTS DATA) */}
                    {/* Desktop: Middle 1/3. Mobile: Top 25% Fixed Height */}
                    <div className="shrink-0 h-[25%] md:h-full md:w-1/3 bg-slate-950 flex flex-col relative z-20 shadow-2xl border-b md:border-b-0 border-white/10 order-first md:order-none overflow-y-auto">
                        <div className="flex-1 flex flex-col items-center justify-center p-2 text-center space-y-2">
                            
                            {/* Detailed Results Text */}
                            <div className="space-y-2 w-full max-w-xs mx-auto flex items-center justify-between gap-4 md:block md:space-y-4">
                                <div className="space-y-0.5 text-left md:text-center">
                                    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-indigo-400">Your Selection</p>
                                    <h3 className="text-xs md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-none">
                                        {isGeocoding ? <Loader2 size={12} className="animate-spin inline text-slate-500" /> : userPlaceName}
                                    </h3>
                                </div>
                                
                                <div className="hidden md:block w-full h-px bg-white/10" />

                                <div className="space-y-0.5 text-right md:text-center">
                                    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-purple-400">Psychic Target</p>
                                    <h3 className="text-xs md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-none">
                                        {target?.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Distance Metrics Compact */}
                            <div className="w-full max-w-xs bg-slate-900/50 rounded-xl md:rounded-2xl border border-white/5 p-2 md:p-6 backdrop-blur-sm flex md:block items-center justify-center gap-2">
                                <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 md:mb-2">Variance:</div>
                                <div className="flex items-baseline gap-1">
                                    <div className="text-lg md:text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                                        {Math.round(distance).toLocaleString()}
                                        <span className="text-[10px] md:text-sm ml-0.5 text-slate-500 font-sans font-normal">mi</span>
                                    </div>
                                    <div className="text-[10px] md:text-sm font-bold text-slate-600 font-mono">
                                        / {Math.round(distance * 1.60934).toLocaleString()} km
                                    </div>
                                </div>
                            </div>

                            {/* Actions Compact */}
                            <div className="flex gap-2 w-full max-w-xs pt-0 md:pt-2">
                                <button 
                                    onClick={() => setShowResultCard(false)}
                                    className="flex-1 py-1.5 md:py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                    <MapIcon size={12} className="md:w-3.5 md:h-3.5" /> See Map
                                </button>
                                <button 
                                    onClick={() => startGame(gameMode!)}
                                    className="flex-1 py-1.5 md:py-3 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                                >
                                    Next <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* MOBILE MAPS CONTAINER - Fills remaining 75% */}
                    <div className="flex-1 flex flex-col md:hidden min-h-0 h-[75%]">
                         {/* Target Map */}
                        <div className="flex-1 border-b border-white/10 relative">
                             <StreetViewPanel coords={resultLocations.target} title={target?.name || "Target"} label="TARGET RESONANCE" className="h-full w-full" />
                        </div>
                        {/* User Map */}
                        <div className="flex-1 relative">
                            <StreetViewPanel coords={resultLocations.user} title={userPlaceName} label="YOUR SELECTION" className="h-full w-full" />
                        </div>
                    </div>

                    {/* 3. RIGHT COLUMN (USER 360) - DESKTOP ONLY */}
                    <div className="hidden md:block md:w-1/3 border-l border-white/10 relative h-full order-last">
                        <StreetViewPanel coords={resultLocations.user} title={userPlaceName} label="YOUR SELECTION" className="h-full w-full" />
                    </div>

                </div>
           </div>
        )}

        {/* --- REVEALED HUD BUTTON (If card closed) --- */}
        {gameState === 'REVEALED' && !showResultCard && (
           <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 min-w-max z-40 animate-in zoom-in duration-300 pointer-events-auto">
             <button onClick={() => setShowResultCard(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 transition-all active:scale-95 hover:scale-105">
                <BarChart3 size={16} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">View Results</span>
             </button>
           </div>
        )}

      </div>

      {/* FOOTER BAR */}
      <div className="flex-none h-8 px-4 bg-slate-950 border-t border-white/5 flex justify-between items-center text-[7px] md:text-[8px] text-slate-600 uppercase tracking-[0.2em] font-black z-50">
        <div className="truncate">Protocol: {gameState === 'TARGETING' ? 'SENSING' : 'ANALYSIS'}</div>
        <div className="truncate px-2 flex items-center gap-2">
          {gameState === 'TARGETING' && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
          {gameState === 'TARGETING' ? 'Signal Active' : 'Data Locked'}
        </div>
        <div className="hidden sm:block">Ref: WGS84</div>
      </div>
    </div>
  );
}

function GoogleMapComponent({ onLoad }: { onLoad: (map: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current && window.google) {
      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat: 20, lng: 0 }, zoom: 2.5, disableDefaultUI: true, backgroundColor: '#f8fafc', styles: BLIND_STYLE, clickableIcons: false, draggable: true, scrollwheel: true, disableDoubleClickZoom: false
      });
      onLoad(map);
    }
  }, []);
  return <div ref={containerRef} className="w-full h-full" />;
}
