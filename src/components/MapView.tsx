import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Polyline, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { Star, MapPin, Route, Info } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 44 : 36;
  const shadow = isSelected ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))';
  const anchorOffset = isSelected ? 22 : 18;
  const popupOffset = isSelected ? 42 : 34;

  return new L.DivIcon({
    className: 'custom-map-pin',
    html: `<div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: ${size}px; height: ${size}px; filter: ${shadow};">
               <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
               <circle cx="12" cy="10" r="3" fill="white"></circle>
             </svg>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [anchorOffset, popupOffset], // Adjusted anchor to point to the bottom tip of the pin
    popupAnchor: [0, -popupOffset], // Position popup slightly above the pin tip
  });
};

const defaultIcon = createCustomIcon('#f97316'); // orange-500
const starredIcon = createCustomIcon('#eab308'); // yellow-500

const categoryColors: Record<string, string> = {
  adventure: '#ef4444', // red
  nature: '#22c55e', // green
  culture: '#a855f7', // purple
  events: '#f59e0b', // amber
  parks: '#10b981', // emerald
  routes: '#3b82f6', // blue
  wellbeing: '#ec4899', // pink
  social: '#6366f1', // indigo
};

interface MapViewProps {
  activities: Activity[];
  center?: [number, number];
  zoom?: number;
  showAll?: boolean; // If true, show all provided activities. If false, only show pinned/starred.
  selectedActivityId?: string;
  onMarkerClick?: (id: string) => void;
  onInfoClick?: (id: string) => void;
  onClearSelection?: () => void;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  // We don't want to use useEffect here as it causes the map to jump around when state changes
  // Only update if center/zoom actually changes significantly, or just rely on initial render
  return null;
}

export function MapView({ activities, center = [36.7783, -119.4179], zoom = 6, showAll = false, selectedActivityId, onMarkerClick, onInfoClick, onClearSelection }: MapViewProps) {
  const { starredIds, pinnedIds, toggleStar, togglePin, calendar, customAnnotations, addAnnotation, removeAnnotation, updateAnnotation } = useAppStore();
  const [showRoute, setShowRoute] = useState(false);
  const [routeGeometries, setRouteGeometries] = useState<[number, number][][]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const displayActivities = showAll 
    ? activities 
    : activities.filter(a => pinnedIds.includes(a.id) || starredIds.includes(a.id));

  const featureGroupRef = useRef<any>(null);

  // Sync feature group with saved annotations
  useEffect(() => {
    if (!featureGroupRef.current) return;
    const fg = featureGroupRef.current;
    
    const existingIds = new Set();
    fg.eachLayer((layer: any) => {
      if (layer.customId) existingIds.add(layer.customId);
    });

    customAnnotations.forEach(annotation => {
      if (existingIds.has(annotation.id)) return;

      let layer;
      if (annotation.type === 'marker') {
        layer = L.marker(annotation.latlngs as [number, number], { icon: defaultIcon });
        layer.bindPopup(annotation.title || 'Nieuwe Marker');
      } else if (annotation.type === 'polyline') {
        layer = L.polyline(annotation.latlngs as [number, number][], { color: '#f97316', weight: 4 });
        if (annotation.title) layer.bindPopup(annotation.title);
      } else if (annotation.type === 'polygon') {
        layer = L.polygon(annotation.latlngs as [number, number][], { color: '#f97316', weight: 4 });
        if (annotation.title) layer.bindPopup(annotation.title);
      }
      
      if (layer) {
        (layer as any).customId = annotation.id;
        fg.addLayer(layer);
      }
    });
    
    // Remove layers that are no longer in customAnnotations
    const currentAnnotationIds = new Set(customAnnotations.map(a => a.id));
    fg.eachLayer((layer: any) => {
      if (layer.customId && !currentAnnotationIds.has(layer.customId)) {
        fg.removeLayer(layer);
      }
    });
  }, [customAnnotations]);

  // Calculate route points based on calendar
  useEffect(() => {
    const fetchRoute = async () => {
      if (!showRoute) {
        setRouteGeometries([]);
        return;
      }

      const points: [number, number][] = [];
      const sortedDates = Object.keys(calendar).sort();
      sortedDates.forEach(date => {
        const dayActivityIds = calendar[date];
        dayActivityIds.forEach(id => {
          const activity = activities.find(a => a.id === id);
          if (activity) {
            points.push([activity.lat, activity.lng]);
          }
        });
      });

      if (points.length < 2) {
        setRouteGeometries([points]);
        return;
      }

      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const coordinates = points.map(p => `${p[1]},${p[0]}`).join(';');
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=true`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 'Ok') {
          throw new Error(`OSRM error: ${data.code}`);
        }
        
        if (data.routes && data.routes.length > 0) {
          const geometries = data.routes.map((route: any) => 
            route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          );
          setRouteGeometries(geometries);
          setSelectedRouteIndex(0);
        } else {
          setRouteGeometries([points]);
          setRouteError("Geen route gevonden.");
        }
      } catch (error) {
        console.error("Failed to fetch route", error);
        setRouteGeometries([points]); // Fallback to straight lines
        setRouteError("Fout bij ophalen route. Toont directe lijnen.");
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [showRoute, calendar, activities]);

  if (displayActivities.length === 0 && !showAll) {
    return (
      <div className="h-full w-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 rounded-2xl border border-stone-200 dark:border-stone-700">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Pin of ster activiteiten om ze hier te zien.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm relative z-0">
      {/* Clear Selection Button */}
      {selectedActivityId && onClearSelection && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={onClearSelection}
            className="px-4 py-2 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-full shadow-md border border-stone-200 dark:border-stone-700 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-2"
          >
            Terug naar lijst
          </button>
        </div>
      )}

      {/* Route Toggle Button & Info */}
      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
        {showRoute && routeGeometries.length > 1 && (
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-200 dark:border-stone-700 p-2 flex gap-1">
            {routeGeometries.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRouteIndex(idx)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedRouteIndex === idx 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
                }`}
              >
                Optie {idx + 1}
              </button>
            ))}
          </div>
        )}
        
        {showRoute && routeError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl shadow-md border border-red-200 dark:border-red-800/30 text-xs font-medium max-w-[200px]">
            {routeError}
          </div>
        )}

        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-md border rounded-xl ${
            showRoute 
              ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800/50 dark:text-orange-400' 
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-700'
          }`}
        >
          <Route className="w-4 h-4" />
          {isLoadingRoute ? 'Laden...' : showRoute ? 'Verberg Route' : 'Toon Route'}
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            onCreated={(e: any) => {
              const { layerType, layer } = e;
              let latlngs;
              if (layerType === 'marker') {
                latlngs = [layer.getLatLng().lat, layer.getLatLng().lng];
                layer.setIcon(defaultIcon);
                layer.bindPopup('Nieuwe Marker');
              } else if (layerType === 'polyline') {
                latlngs = layer.getLatLngs().map((ll: any) => [ll.lat, ll.lng]);
                layer.setStyle({ color: '#f97316', weight: 4 });
              } else if (layerType === 'polygon') {
                latlngs = layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]);
                layer.setStyle({ color: '#f97316', weight: 4 });
              }
              
              const newId = Date.now().toString();
              layer.customId = newId;
              
              addAnnotation({
                id: newId,
                type: layerType as 'marker' | 'polyline' | 'polygon',
                latlngs,
                title: layerType === 'marker' ? 'Nieuwe Marker' : 'Nieuwe Route'
              });
            }}
            onEdited={(e: any) => {
              const { layers } = e;
              layers.eachLayer((layer: any) => {
                if (!layer.customId) return;
                
                let latlngs;
                if (layer instanceof L.Marker) {
                  latlngs = [layer.getLatLng().lat, layer.getLatLng().lng];
                } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                  latlngs = (layer.getLatLngs() as any[]).map((ll: any) => [ll.lat, ll.lng]);
                } else if (layer instanceof L.Polygon) {
                  latlngs = (layer.getLatLngs() as any[])[0].map((ll: any) => [ll.lat, ll.lng]);
                }
                
                if (latlngs) {
                  updateAnnotation(layer.customId, { latlngs });
                }
              });
            }}
            onDeleted={(e) => {
              const { layers } = e;
              layers.eachLayer((layer: any) => {
                if (layer.customId) {
                  removeAnnotation(layer.customId);
                }
              });
            }}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: {
                icon: defaultIcon
              },
              polyline: {
                shapeOptions: {
                  color: '#f97316',
                  weight: 4
                }
              },
              polygon: {
                shapeOptions: {
                  color: '#f97316',
                  weight: 4
                }
              }
            }}
          />
        </FeatureGroup>

        {/* Layer Control for Map Types */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standaard (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelliet (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrein (OpenTopoMap)">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
        >
          {displayActivities.map((activity) => {
            const isStarred = starredIds.includes(activity.id);
            const isPinned = pinnedIds.includes(activity.id);
            const isSelected = activity.id === selectedActivityId;
            
            // Feature 3: Category specific icons
            const catColor = categoryColors[activity.category] || '#f97316';
            
            // Create a slightly larger icon for the selected marker
            const icon = isStarred 
              ? (isSelected ? createCustomIcon('#eab308', true) : starredIcon)
              : (isSelected ? createCustomIcon(catColor, true) : createCustomIcon(catColor));
            
            return (
                <Marker 
                key={activity.id} 
                position={[activity.lat, activity.lng]}
                icon={icon}
                zIndexOffset={isSelected ? 1000 : 0}
                opacity={selectedActivityId && !isSelected ? 0.6 : 1}
                eventHandlers={{
                  click: (e) => {
                    const map = e.target._map;
                    if (map) {
                      map.flyTo([activity.lat, activity.lng], 12, { animate: true, duration: 1.5 });
                    }
                    if (onMarkerClick) onMarkerClick(activity.id);
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 pr-6 min-w-[260px]">
                    {activity.photoUrl && (
                      <img 
                        src={activity.photoUrl} 
                        alt={activity.title} 
                        className="w-full h-32 object-cover rounded-xl mb-3 shadow-sm"
                      />
                    )}
                    <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 leading-tight mb-1">{activity.title}</h3>
                    
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 text-xs rounded-md capitalize">{activity.category}</span>
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 text-xs rounded-md">{activity.region}</span>
                    </div>
                    
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">{activity.description}</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(activity.id); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          isStarred 
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400 dark:hover:bg-yellow-900/50 shadow-sm' 
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-600 shadow-sm'
                        }`}
                        title={isStarred ? "Verwijder ster" : "Geef ster"}
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                      </button>
                      
                      {showAll && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePin(activity.id); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                            isPinned 
                              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:border-orange-700/50 dark:text-orange-400 dark:hover:bg-orange-900/50 shadow-sm' 
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-600 shadow-sm'
                          }`}
                          title={isPinned ? "Verwijder pin" : "Pin op kaart"}
                        >
                          <MapPin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {onInfoClick && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onInfoClick(activity.id); }}
                          className="flex-[2] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-600 shadow-sm"
                        >
                          <Info className="w-4 h-4" />
                          Meer info
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {showRoute && routeGeometries.map((geometry, index) => {
          const isSelected = index === selectedRouteIndex;
          return (
            <Polyline 
              key={index}
              positions={geometry} 
              color={isSelected ? "#f97316" : "#94a3b8"} 
              weight={isSelected ? 5 : 3} 
              opacity={isSelected ? 0.9 : 0.5} 
              dashArray={geometry.length === displayActivities.length ? "10, 10" : undefined}
              eventHandlers={{
                click: () => setSelectedRouteIndex(index)
              }}
              className="cursor-pointer"
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
