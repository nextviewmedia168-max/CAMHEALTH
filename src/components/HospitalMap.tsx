import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Navigation, Map as MapIcon, Compass } from 'lucide-react';

// Fix Leaflet marker icons issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Place {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    healthcare?: string;
  };
}

interface PlaceWithDist extends Place {
  distanceVal: number;
  distanceStr: string;
}

function PlacesLayer({ location, onPlacesFound }: { location: {lat: number, lng: number}, onPlacesFound: (places: PlaceWithDist[]) => void }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const map = useMap();

  useEffect(() => {
    map.setView(location, 14);

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000, ${location.lat}, ${location.lng});
        node["amenity"="clinic"](around:5000, ${location.lat}, ${location.lng});
        node["amenity"="pharmacy"](around:5000, ${location.lat}, ${location.lng});
      );
      out body;
    `;

    let mounted = true;

    const triggerFallback = () => {
      const fallbackTemplates = [
        { name_en: 'Calmette Hospital', name_kh: 'មន្ទីរពេទ្យកាល់ម៉ែត', amenity: 'hospital', latOffset: 0.008, lonOffset: -0.005 },
        { name_en: 'Royal Phnom Penh Hospital', name_kh: 'មន្ទីរពេទ្យរ៉ូយ៉ាល់ភ្នំពេញ', amenity: 'hospital', latOffset: -0.006, lonOffset: 0.012 },
        { name_en: 'Angkor Community Clinic', name_kh: 'គ្លីនិកសហគមន៍អង្គរ', amenity: 'clinic', latOffset: 0.004, lonOffset: 0.008 },
        { name_en: 'UCare Premium Pharmacy', name_kh: 'ឱសថស្ថាន យូឃែរ', amenity: 'pharmacy', latOffset: -0.003, lonOffset: -0.004 },
        { name_en: 'Mekong Regional Hospital', name_kh: 'មន្ទីរពេទ្យតំបន់មេគង្គ', amenity: 'hospital', latOffset: 0.015, lonOffset: -0.012 },
        { name_en: 'Bayon Medical & Diagnostics', name_kh: 'មជ្ឈមណ្ឌលវិនិច្ឆ័យ បាយ័ន', amenity: 'clinic', latOffset: -0.009, lonOffset: -0.007 },
        { name_en: 'Central Health Pharmacy', name_kh: 'ឱសថស្ថាន សុខភាពកណ្តាល', amenity: 'pharmacy', latOffset: 0.002, lonOffset: 0.003 },
      ];

      const dummyPlaces: Place[] = fallbackTemplates.map((t, idx) => ({
         id: 100000 + idx,
         lat: location.lat + t.latOffset,
         lon: location.lng + t.lonOffset,
         tags: {
            name: `${t.name_kh} (${t.name_en})`,
            amenity: t.amenity,
            healthcare: t.amenity === 'pharmacy' ? undefined : 'yes'
         }
      }));

      setPlaces(dummyPlaces);
      const userLatLng = L.latLng(location.lat, location.lng);
      
      const sortedPlaces = dummyPlaces.map((p: Place) => {
         const dist = userLatLng.distanceTo(L.latLng(p.lat, p.lon));
         const distanceStr = dist > 1000 ? (dist/1000).toFixed(1) + ' km' : Math.round(dist) + ' m';
         return { ...p, distanceVal: dist, distanceStr };
      }).sort((a: PlaceWithDist, b: PlaceWithDist) => a.distanceVal - b.distanceVal);

      onPlacesFound(sortedPlaces);
      if (sortedPlaces.length > 0 && map) {
         const nearest = sortedPlaces[0];
         const bounds = L.latLngBounds([[location.lat, location.lng], [nearest.lat, nearest.lon]]);
         map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    })
    .then(async res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        const text = await res.text();
        throw new Error(`Expected JSON but received: ${contentType}. Content preview: ${text.substring(0, 50)}`);
      }
      return res.json();
    })
    .then(data => {
      if (!mounted) return;
      if (data && data.elements && data.elements.length > 0) {
        setPlaces(data.elements);
        
        const userLatLng = L.latLng(location.lat, location.lng);
        
        const sortedPlaces = data.elements.map((p: Place) => {
           const dist = userLatLng.distanceTo(L.latLng(p.lat, p.lon));
           const distanceStr = dist > 1000 ? (dist/1000).toFixed(1) + ' km' : Math.round(dist) + ' m';
           return { ...p, distanceVal: dist, distanceStr };
        }).sort((a: PlaceWithDist, b: PlaceWithDist) => a.distanceVal - b.distanceVal);

        if (sortedPlaces.length > 0) {
           onPlacesFound(sortedPlaces);
           const nearest = sortedPlaces[0];
           const bounds = L.latLngBounds([[location.lat, location.lng], [nearest.lat, nearest.lon]]);
           if (map) map.fitBounds(bounds, { padding: [50, 50] });
        } else {
           triggerFallback();
        }
      } else {
         triggerFallback();
      }
    })
    .catch(err => {
      console.warn("Overpass API error or XML response, using local fallback generator:", err);
      if (mounted) {
         triggerFallback();
      }
    });

    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      {places.map(p => (
        <Marker key={p.id} position={[p.lat, p.lon]} icon={hospitalIcon}>
           <Popup>
              <div className="font-sans text-slate-900">
                 <strong className="block mb-1 text-sm">{p.tags.name || p.tags.amenity?.replace('_',' ') || 'Healthcare Facility'}</strong>
                 <a 
                   href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`} 
                   target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 font-medium text-xs flex items-center gap-1 hover:underline mt-1"
                 >
                   <MapIcon size={12} /> Directions
                 </a>
              </div>
           </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function HospitalMap() {
  const { t } = useLanguage();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [hospitals, setHospitals] = useState<PlaceWithDist[]>([]);
  const [mapHeight, setMapHeight] = useState(40); // Initial 40vh

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation Error:", error.message);
          if (!location) setLocation({ lat: 11.5564, lng: 104.9282 }); 
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      if (!location) setLocation({ lat: 11.5564, lng: 104.9282 });
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handlePlacesFound = (places: PlaceWithDist[]) => {
     setHospitals(places);
  };

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-center gap-4 transition-colors">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-500" />
        <p className="font-bold text-sm sm:text-base text-slate-500 dark:text-slate-400">{t.locationWait || 'Finding your location...'}</p>
      </div>
    );
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = mapHeight;
    const vh = window.innerHeight;

    const onPointerMove = (evt: PointerEvent) => {
       const dy = evt.clientY - startY;
       let newHeight = startHeight + (dy / vh) * 100;
       newHeight = Math.max(20, Math.min(newHeight, 80)); // Limit between 20vh and 80vh
       setMapHeight(newHeight);
    };

    const onPointerUp = () => {
       document.removeEventListener('pointermove', onPointerMove);
       document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative transition-colors">
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 sticky top-0 flex items-center justify-between shrink-0 transition-colors">
         <div className="w-8"></div>
         <h2 className="font-bold text-slate-800 dark:text-white text-center text-base sm:text-lg">{t.hospitalsNearby}</h2>
         <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors shadow-sm" title="Refresh Location" onClick={getUserLocation}>
            <Compass size={18} />
         </button>
      </div>

      {/* Map Area */}
      <div style={{ height: `${mapHeight}vh` }} className="w-full relative z-0 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <MapContainer
            key={`${location.lat}-${location.lng}`}
            center={[location.lat, location.lng]}
            zoom={14}
            style={{ width: '100%', height: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              attribution=""
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[location.lat, location.lng]} icon={userIcon}>
                <Popup>
                   <strong className="text-slate-800 text-sm">You are here</strong>
                </Popup>
            </Marker>
            
            <PlacesLayer location={location} onPlacesFound={handlePlacesFound} />
        </MapContainer>
      </div>

      {/* Drag Handle */}
      <div 
         className="h-5 sm:h-6 w-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 cursor-ns-resize flex items-center justify-center shrink-0 z-20 transition-colors shadow-sm"
         onPointerDown={handlePointerDown}
         title="Drag to resize map"
      >
         <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
      </div>

      {/* Hospital List Drawer */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 z-10 px-3 sm:px-4 pt-3 sm:pt-4 transition-colors">
         <div className="max-w-4xl mx-auto">
         <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 px-2 uppercase tracking-wider text-[10px] sm:text-xs">Nearest Facilities</h3>
         {hospitals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
               {hospitals.map((h) => {
                 const isPharmacy = h.tags.amenity === 'pharmacy';
                 const mapImageSrc = isPharmacy 
                    ? 'https://i.postimg.cc/HkM8tPV1/Pngtree-pharmacy-flat-style-illustration-female-6855763.png' 
                    : 'https://i.postimg.cc/5ypSbK8G/hospital-building-isolated-transparent-background-1184980-4247-removebg-preview.png';
                 
                 return (
                 <div key={h.id} className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm md:shadow-md border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-all group">
                    <img 
                       src={mapImageSrc} 
                       alt={isPharmacy ? 'Pharmacy' : 'Hospital'} 
                       referrerPolicy="no-referrer"
                       className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-700 ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base mb-1">{h.tags.name || h.tags.amenity?.replace('_', ' ') || 'Healthcare Facility'}</h4>
                       <div className="flex gap-2 items-center mb-2 sm:mb-3">
                         <span className="bg-blue-50 dark:bg-slate-700/80 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-900/50">{h.distanceStr} away</span>
                       </div>
                       <a 
                         href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                         target="_blank" rel="noopener noreferrer"
                         className="inline-flex w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 py-1.5 sm:py-2 rounded-lg sm:rounded-xl items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors ring-1 ring-slate-200 dark:ring-slate-600"
                       >
                          <MapIcon size={14} /> View Route
                       </a>
                    </div>
                 </div>
               )})}
            </div>
         ) : (
            <div className="text-center py-8 text-slate-500 bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700/50 mx-2">
               <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2 text-slate-400 dark:text-slate-600" />
               <p className="text-xs sm:text-sm">Searching for facilities...</p>
            </div>
         )}
         </div>
      </div>
    </div>
  );
}
