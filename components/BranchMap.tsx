import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Branch, LiquidityStatus } from '../types';
import { IconLocate, IconRefresh, IconX, IconBank, IconMapPin } from './Icons';
import StatusBadge from './StatusBadge';

interface Props {
  branches: Branch[];
  onSelectBranch: (branch: Branch) => void;
  onReport?: (branch: Branch) => void;
}

const DEFAULT_CENTER: L.LatLngExpression = [32.8872, 13.1913];
const DEFAULT_ZOOM = 12;

// Helper to get color hex code
export const getStatusColorHex = (status: LiquidityStatus) => {
  switch(status) {
    case LiquidityStatus.AVAILABLE: return "#22c55e"; // Green 500
    case LiquidityStatus.EMPTY: return "#ef4444"; // Red 500
    case LiquidityStatus.CROWDED: return "#eab308"; // Yellow 500
    default: return "#9ca3af";
  }
};

export const MiniBranchMap: React.FC<{ branch: Branch }> = ({ branch }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Tiny delay to ensure container size is calculated if inside hidden/animated div
    const timer = setTimeout(() => {
        if (!mapRef.current) return;
        
        const map = L.map(mapRef.current, {
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          attributionControl: false,
          keyboard: false
        }).setView([branch.lat, branch.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const color = getStatusColorHex(branch.status);
        const customIcon = L.divIcon({
          className: 'mini-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([branch.lat, branch.lng], { icon: customIcon }).addTo(map);

        // Cleanup
        return () => {
          map.remove();
        };
    }, 100);

    return () => clearTimeout(timer);
  }, [branch]);

  return <div ref={mapRef} className="w-full h-32 rounded-xl bg-gray-100 dark:bg-gray-800 z-0" />;
};

const BranchMap: React.FC<Props> = ({ branches, onSelectBranch, onReport }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM); // Default to Tripoli

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Create a layer group for markers to manage them easily
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
      
      // Close bottom sheet when clicking on map background
      map.on('click', () => {
        setSelectedBranch(null);
      });
    }

    // Update Markers
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (map && markersLayer) {
      markersLayer.clearLayers();

      const bounds = L.latLngBounds([]);

      branches.forEach(branch => {
        const color = getStatusColorHex(branch.status);
        
        // Custom marker using DivIcon for CSS styling
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10]
        });

        const marker = L.marker([branch.lat, branch.lng], { icon: customIcon })
          .bindPopup(`
            <div dir="rtl" class="font-sans text-right min-w-[150px]">
              <strong class="text-sm block mb-1">${branch.name}</strong>
              <span class="text-xs text-gray-600 block">${branch.address}</span>
            </div>
          `);
        
        marker.on('click', () => {
          map.flyTo([branch.lat, branch.lng], 15, { animate: true, duration: 1.5 });
          marker.openPopup();
          setSelectedBranch(branch);
          // Note: We don't call onSelectBranch immediately anymore to allow viewing the map
        });

        markersLayer.addLayer(marker);
        bounds.extend([branch.lat, branch.lng]);
      });

      // Fit bounds if we have branches and no user location set yet
      // Only fit bounds if we don't have a selected branch (to avoid jumping away)
      if (branches.length > 0 && !userMarkerRef.current && !selectedBranch) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    // Cleanup function
    return () => {
      // We generally want to keep the map instance alive during re-renders
    };
  }, [branches]); // Removed onSelectBranch dependency to prevent map re-init loops if it changes

  const handleLocateMe = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      alert("عذراً، المتصفح لا يدعم تحديد الموقع الجغرافي.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        
        if (map) {
          // Remove existing user marker if exists
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          // Create custom icon for user location (Blue pulse)
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `
              <div class="relative flex h-6 w-6">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-500 border-2 border-white shadow-md"></span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          });

          const marker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="text-center font-bold text-sm">موقعك الحالي</div>')
            .openPopup();
          
          userMarkerRef.current = marker;
          map.flyTo([latitude, longitude], 14, { animate: true, duration: 1.5 });
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "تعذر تحديد موقعك. يرجى التحقق من إعدادات الموقع.";
        if (error.code === error.PERMISSION_DENIED) {
            msg = "تم رفض إذن الوصول للموقع.";
        }
        alert(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.5 });
      map.closePopup();
      setSelectedBranch(null);
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner group">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 dark:brightness-[0.7] dark:invert dark:hue-rotate-180 dark:contrast-[0.8]"
        style={{ background: '#f0f0f0' }}
      ></div>

      {/* Control Buttons */}
      <div className={`absolute bottom-4 left-4 z-[400] flex flex-col gap-2 transition-transform duration-300 ${selectedBranch ? '-translate-y-48' : ''}`}>
        <button 
          onClick={handleResetView}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all active:scale-95"
          title="إعادة تعيين العرض"
        >
          <IconRefresh className="w-5 h-5" />
        </button>
        
        <button 
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all active:scale-95 disabled:opacity-70"
          title="تحديد موقعي"
        >
          <IconLocate className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Legend Overlay - Hide when bottom sheet is open */}
      <div className={`absolute bottom-4 right-4 z-[400] bg-white/95 dark:bg-gray-800/95 p-3 rounded-lg text-xs shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-300 ${selectedBranch ? 'translate-y-full opacity-0' : ''}`}>
        <div className="font-bold mb-2 text-center text-gray-500 dark:text-gray-400">مفتاح الحالة</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></span> 
            <span>سيولة متوفرة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm"></span> 
            <span>مزدحم</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></span> 
            <span>فارغ</span>
          </div>
           <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></span> 
            <span>موقعك</span>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Sheet */}
      {selectedBranch && (
        <div className="absolute bottom-0 left-0 right-0 z-[500] bg-white dark:bg-gray-800 rounded-t-2xl shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] p-5 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom duration-300">
          <button 
            onClick={() => setSelectedBranch(null)}
            className="absolute top-4 left-4 p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="mb-4 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedBranch.name}</h3>
              {selectedBranch.isAtm && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100 dark:border-blue-800">ATM</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IconMapPin className="w-3 h-3" />
              {selectedBranch.address}
            </p>
          </div>

          <div className="flex items-center justify-between mb-5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
             <StatusBadge status={selectedBranch.status} />
             <div className="text-right">
               <span className="text-[10px] text-gray-400 block mb-0.5">آخر تحديث</span>
               <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                 {selectedBranch.lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
             </div>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => onSelectBranch(selectedBranch)}
               className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
             >
               <IconBank className="w-4 h-4" />
               عرض التفاصيل
             </button>
             {onReport && (
               <button 
                 onClick={() => onReport(selectedBranch)}
                 className="flex-1 py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
               >
                 <IconRefresh className="w-4 h-4" />
                 إبلاغ
               </button>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchMap;
