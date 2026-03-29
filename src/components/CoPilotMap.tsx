import { useEffect, useState, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore, AIScenario } from '../store';
import { Activity } from '../types';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `;

  return new L.DivIcon({
    className: 'custom-map-pin',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -32],
  });
};

function MapController({ scenarios, activeScenarioId }: { scenarios: AIScenario[], activeScenarioId: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (scenarios.length === 0) return;

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    scenarios.forEach(scenario => {
      // If there's an active scenario, only focus on that one
      if (activeScenarioId && scenario.id !== activeScenarioId) return;

      scenario.waypoints.forEach(wp => {
        bounds.extend([wp.lat, wp.lng]);
        hasPoints = true;
      });
      if (scenario.routeCoordinates) {
        scenario.routeCoordinates.forEach(coord => {
          bounds.extend(coord);
        });
      }
    });

    if (hasPoints) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [scenarios, activeScenarioId, map]);

  return null;
}

export function CoPilotMap({ activities }: { activities: Activity[] }) {
  const { aiScenarios, activeScenarioId, updateScenarioRoute } = useAppStore();

  // Fetch routes for scenarios that don't have them yet
  useEffect(() => {
    aiScenarios.forEach(async (scenario) => {
      if (!scenario.routeCoordinates && scenario.waypoints.length >= 2) {
        const cacheKey = `route-${scenario.id}`;
        const cachedRoute = localStorage.getItem(cacheKey);

        if (cachedRoute) {
          const { coords, distance, duration } = JSON.parse(cachedRoute);
          updateScenarioRoute(scenario.id, coords, distance, duration);
          return;
        }

        try {
          const coordinates = scenario.waypoints.map(p => `${p.lng},${p.lat}`).join(';');
          const response = await fetch(`https://router.project-osrm.org/route/v1/${scenario.transportMode === 'walking' ? 'foot' : 'driving'}/${coordinates}?overview=full&geometries=geojson`);
          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            const distance = data.routes[0].distance;
            const duration = data.routes[0].duration;
            
            updateScenarioRoute(scenario.id, coords, distance, duration);
            localStorage.setItem(cacheKey, JSON.stringify({ coords, distance, duration }));
          } else {
            // Fallback to straight lines
            updateScenarioRoute(scenario.id, scenario.waypoints.map(w => [w.lat, w.lng]));
          }
        } catch (error) {
          console.error("Failed to fetch route for scenario", error);
          // Fallback to straight lines
          updateScenarioRoute(scenario.id, scenario.waypoints.map(w => [w.lat, w.lng]));
        }
      }
    });
  }, [aiScenarios, updateScenarioRoute]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm relative z-0">
      <MapContainer 
        center={[36.7783, -119.4179]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {aiScenarios.length > 0 && (
          <MapController scenarios={aiScenarios} activeScenarioId={activeScenarioId} />
        )}

        {/* Draw Starred Activities as Context */}
        {activities.map(activity => (
          <Marker 
            key={`context-${activity.id}`}
            position={[activity.lat, activity.lng]}
            icon={createCustomIcon('#eab308')} // yellow-500
            opacity={0.5}
            zIndexOffset={-100}
          >
            <Popup className="custom-popup">
              <div className="p-4 pr-6 min-w-[200px]">
                <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 leading-tight mb-1">{activity.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">Gemarkeerd als favoriet</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {aiScenarios.map(scenario => {
          const isActive = activeScenarioId === scenario.id || !activeScenarioId;
          const isFaded = activeScenarioId && activeScenarioId !== scenario.id;
          
          return (
            <Fragment key={scenario.id}>
              {/* Draw Route */}
              {scenario.routeCoordinates && (
                <Polyline 
                  positions={scenario.routeCoordinates} 
                  color={scenario.color} 
                  weight={isActive ? 5 : 3} 
                  opacity={isFaded ? 0.3 : 0.8}
                  dashArray={scenario.transportMode === 'flying' ? "10, 10" : undefined}
                />
              )}

              {/* Draw Waypoints */}
              {scenario.waypoints.map((wp, idx) => (
                <Marker 
                  key={`${scenario.id}-wp-${idx}`}
                  position={[wp.lat, wp.lng]}
                  icon={createCustomIcon(scenario.color)}
                  opacity={isFaded ? 0.4 : 1}
                  zIndexOffset={isActive ? 1000 : 0}
                >
                  <Popup className="custom-popup">
                    <div className="p-4 pr-6 min-w-[200px]">
                      <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 leading-tight mb-1">{wp.name}</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{scenario.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
