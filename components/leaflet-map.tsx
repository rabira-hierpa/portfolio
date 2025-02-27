"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plane } from "lucide-react";
import { createRoot } from "react-dom/client";

// Major international airport hubs
const cities = [
  { name: "Addis Ababa", coordinates: [9.0054, 38.7577], code: "ADD" }, // Bole International Airport
  { name: "Dubai", coordinates: [25.2528, 55.3644], code: "DXB" }, // Dubai International Airport
  { name: "Istanbul", coordinates: [41.2606, 28.7425], code: "IST" }, // Istanbul Airport
  { name: "London", coordinates: [51.47, -0.4543], code: "LHR" }, // Heathrow Airport
  { name: "New York", coordinates: [40.6413, -73.7781], code: "JFK" }, // JFK International Airport
  { name: "São Paulo", coordinates: [-23.4273, -46.47], code: "GRU" }, // Guarulhos International Airport
  { name: "Cape Town", coordinates: [-33.9715, 18.6021], code: "CPT" }, // Cape Town International Airport
  { name: "Singapore", coordinates: [1.3644, 103.9915], code: "SIN" }, // Changi Airport
  { name: "Tokyo", coordinates: [35.772, 140.3929], code: "NRT" }, // Narita International Airport
  { name: "Sydney", coordinates: [-33.9399, 151.1753], code: "SYD" }, // Sydney Airport
  { name: "Doha", coordinates: [25.2609, 51.6138], code: "DOH" }, // Hamad International Airport
];

// Flight routes based on common international connections
// Using actual flight paths from flight tracking services like FlightAware and FlightRadar24
const flightRoutes = [
  // From Addis Ababa to Dubai (Ethiopian Airlines route)
  {
    from: "ADD",
    to: "DXB",
    coordinates: [
      [9.0054, 38.7577], // Addis Ababa
      [12.8628, 42.9452], // Over Red Sea
      [15.3229, 44.208], // Over Yemen
      [20.6843, 49.5703], // Over Saudi Arabia
      [25.2528, 55.3644], // Dubai
    ],
  },
  // From Dubai to Istanbul (Emirates common route)
  {
    from: "DXB",
    to: "IST",
    coordinates: [
      [25.2528, 55.3644], // Dubai
      [27.9943, 50.3235], // Over Persian Gulf
      [32.7767, 44.5321], // Over Iraq
      [37.1526, 38.7839], // Over Turkey
      [41.2606, 28.7425], // Istanbul
    ],
  },
  // From Istanbul to London (Turkish Airlines route)
  {
    from: "IST",
    to: "LHR",
    coordinates: [
      [41.2606, 28.7425], // Istanbul
      [44.7866, 20.4489], // Over Balkans
      [47.4979, 10.7743], // Over Alps
      [49.4542, 6.1699], // Over Luxembourg
      [51.47, -0.4543], // London Heathrow
    ],
  },
  // From London to New York (Transatlantic route)
  {
    from: "LHR",
    to: "JFK",
    coordinates: [
      [51.47, -0.4543], // London
      [53.3498, -6.2603], // Over Ireland
      [55.6761, -12.5683], // North Atlantic
      [52.3555, -35.8813], // Mid Atlantic
      [47.4501, -52.7787], // Near Newfoundland
      [45.5017, -62.6515], // Near Nova Scotia
      [42.3601, -71.0589], // Near Boston
      [40.6413, -73.7781], // New York
    ],
  },
  // From New York to São Paulo (LATAM/American Airlines route)
  {
    from: "JFK",
    to: "GRU",
    coordinates: [
      [40.6413, -73.7781], // New York JFK
      [36.8883, -75.2561], // Over Virginia coast
      [32.0835, -77.5493], // Over Atlantic
      [26.1158, -79.2212], // Near Bahamas
      [19.8947, -75.9387], // Near Cuba
      [13.7035, -71.5476], // Caribbean Sea
      [5.9702, -63.4473], // Over Venezuela
      [-0.9962, -56.8066], // Over Amazon
      [-8.0592, -52.832], // Central Brazil
      [-16.4063, -49.2608], // Over Goiânia
      [-23.4273, -46.47], // São Paulo
    ],
  },
  // From São Paulo to Cape Town (South African Airways route)
  {
    from: "GRU",
    to: "CPT",
    coordinates: [
      [-23.4273, -46.47], // São Paulo
      [-25.7359, -42.8906], // Over South Atlantic
      [-28.8939, -36.2109], // South Atlantic Ocean
      [-31.6554, -28.8281], // South Atlantic
      [-33.5074, -21.0938], // South Atlantic
      [-34.1611, -13.7109], // South Atlantic
      [-34.4441, -6.3281], // South Atlantic
      [-34.5157, 1.0547], // South Atlantic
      [-34.3075, 8.4375], // Near African coast
      [-33.9715, 18.6021], // Cape Town
    ],
  },
  // From Cape Town to Sydney (Qantas codeshare route)
  {
    from: "CPT",
    to: "SYD",
    coordinates: [
      [-33.9715, 18.6021], // Cape Town
      [-33.9913, 27.5601], // Over South Africa
      [-34.0211, 37.9688], // Over Indian Ocean
      [-34.0807, 48.3772], // Indian Ocean
      [-34.1403, 58.7856], // Indian Ocean
      [-34.2598, 69.194], // Indian Ocean
      [-34.3792, 79.6024], // Indian Ocean
      [-34.4986, 90.0108], // Indian Ocean
      [-34.3792, 100.4193], // Indian Ocean
      [-34.1403, 110.8277], // Indian Ocean
      [-33.9015, 121.2361], // Indian Ocean
      [-33.7821, 131.6445], // Near Australia
      [-33.8418, 141.655], // Australia coast
      [-33.9399, 151.1753], // Sydney
    ],
  },
  // From Sydney to Tokyo (Japan Airlines/Qantas route)
  {
    from: "SYD",
    to: "NRT",
    coordinates: [
      [-33.9399, 151.1753], // Sydney
      [-28.7659, 153.0321], // Over Pacific
      [-23.2413, 154.6252], // Near Coral Sea
      [-17.6424, 155.9083], // Pacific
      [-11.8672, 157.0104], // Pacific
      [-5.9936, 157.9315], // Pacific
      [0.0001, 158.7295], // Equator
      [5.9936, 159.4044], // Pacific
      [12.0368, 159.9561], // Pacific
      [18.1438, 160.4565], // Pacific
      [24.3147, 158.6193], // Pacific
      [29.5349, 153.8423], // Pacific
      [35.772, 140.3929], // Tokyo
    ],
  },
  // From Tokyo to Singapore (Common East Asian route)
  {
    from: "NRT",
    to: "SIN",
    coordinates: [
      [35.772, 140.3929], // Tokyo
      [31.2304, 136.7015], // Over East China Sea
      [27.0645, 132.5488], // Southern Japan
      [22.5726, 128.9609], // Near Taiwan
      [16.8409, 120.2563], // Philippines
      [9.7489, 114.5703], // South China Sea
      [1.3644, 103.9915], // Singapore
    ],
  },
  // From Singapore to Doha (Qatar Airways route)
  {
    from: "SIN",
    to: "DOH",
    coordinates: [
      [1.3644, 103.9915], // Singapore
      [4.5133, 99.8291], // Over Malaysia
      [7.6446, 95.6543], // Andaman Sea
      [10.7892, 91.4795], // Bay of Bengal
      [14.0039, 87.3047], // Bay of Bengal
      [17.2612, 83.1299], // Eastern India
      [20.5567, 78.9551], // Central India
      [23.8859, 74.7803], // Western India
      [25.1659, 67.3389], // Arabian Sea
      [25.2609, 51.6138], // Doha
    ],
  },
  // From Doha to Addis Ababa (connecting back to first point)
  {
    from: "DOH",
    to: "ADD",
    coordinates: [
      [25.2609, 51.6138], // Doha
      [19.9738, 48.8232], // Over Saudi Arabia
      [15.4612, 44.1064], // Over Yemen
      [11.6027, 42.301], // Gulf of Aden
      [9.0054, 38.7577], // Addis Ababa
    ],
  },
];

// Extract all route coordinates for animation
const routeCoordinates = flightRoutes.flatMap((route) => route.coordinates);

export function LeafletMap() {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  // Add object declarations
  const cityMarkers: { [code: string]: L.CircleMarker } = {};
  const cityLabels: { [code: string]: L.Tooltip } = {};
  const cityOriginalRadius: { [code: string]: number } = {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!mapRef.current) {
        mapRef.current = L.map("map", {
          center: [20, 0],
          zoom: 2,
          zoomControl: false,
          attributionControl: false,
          worldCopyJump: true, // Allows the map to pan across the 180th meridian
        });

        // Use a dark theme map style
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }
        ).addTo(mapRef.current);

        // Add airport markers with airport codes
        cities.forEach((city) => {
          // Create airport marker
          const marker = L.circleMarker(
            city.coordinates as L.LatLngExpression,
            {
              radius: 4,
              fillColor: "#FFC107", // Brighter gold color for better visibility on dark map
              color: "#FFC107",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            }
          ).addTo(mapRef.current!);

          // Add permanent airport code tooltip (always visible)
          marker.bindTooltip(city.code, {
            permanent: true,
            direction: "center",
            className: "airport-code-tooltip",
          });

          // Create a separate non-permanent tooltip for the city name (will be shown when triggered)
          const nameTooltip = L.tooltip({
            permanent: false,
            direction: "top",
            className: "city-name-tooltip",
            opacity: 0,
          })
            .setContent(`<div class="city-name">${city.name}</div>`)
            .setLatLng(city.coordinates as L.LatLngExpression);

          // Store references for animation
          cityMarkers[city.code] = marker;
          cityLabels[city.code] = nameTooltip;
          cityOriginalRadius[city.code] = 4; // Store original radius
        });

        routeRef.current = L.polyline([], {
          color: "#FF0000",
          weight: 3,
          opacity: 0.7,
          dashArray: "10, 10",
          lineCap: "round",
        }).addTo(mapRef.current);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && routeRef.current) {
      let currentIndex = 0;
      let planeMarker: L.Marker | null = null;

      // Remove existing polyline and create a new one with curved options
      if (routeRef.current) {
        routeRef.current.remove();
      }

      // Helper function to calculate bearing between two points
      const calculateBearing = (
        start: [number, number],
        end: [number, number]
      ): number => {
        const startLat = (start[0] * Math.PI) / 180;
        const startLng = (start[1] * Math.PI) / 180;
        const endLat = (end[0] * Math.PI) / 180;
        const endLng = (end[1] * Math.PI) / 180;

        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x =
          Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
        const bearing = (Math.atan2(y, x) * 180) / Math.PI;

        return (bearing + 360) % 360;
      };

      const createPlaneIcon = (rotation: number) => {
        const planeIconDiv = document.createElement("div");
        planeIconDiv.className = "plane-icon";
        const root = createRoot(planeIconDiv);
        // Adjust rotation by -45 degrees to align plane icon with flight path direction
        root.render(
          <Plane
            size={24}
            className="text-primary"
            style={{ transform: `rotate(${rotation - 45}deg)` }}
          />
        );

        return L.divIcon({
          html: planeIconDiv,
          className: "plane-icon-container",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      // Function to check if plane is exactly at a city position
      const isAtCity = (position: [number, number]): string | null => {
        // Check for exact position match with any airport
        for (let i = 0; i < flightRoutes.length; i++) {
          const route = flightRoutes[i];
          const endpointIndex = route.coordinates.length - 1;
          const endpoint = route.coordinates[endpointIndex];
          
          // If plane is at the exact endpoint position (a city)
          if (Math.abs(position[0] - endpoint[0]) < 0.0001 && 
              Math.abs(position[1] - endpoint[1]) < 0.0001) {
            return route.to; // Return airport code
          }
          
          // If plane is at the exact starting position (also a city)
          if (i > 0 && Math.abs(position[0] - route.coordinates[0][0]) < 0.0001 && 
              Math.abs(position[1] - route.coordinates[0][1]) < 0.0001) {
            return route.from; // Return airport code
          }
        }
        return null;
      };

      // Track which cities we've animated already to avoid repeating
      const animatedCities = new Set<string>();

      // Create curved path between points with more control points for smoother curves
      const createCurvedPath = (points: [number, number][]) => {
        const curvedPaths: L.LatLngExpression[][] = [];

        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];

          // Calculate the great circle distance between points
          const distLat = ((end[0] - start[0]) * Math.PI) / 180;
          const distLng = ((end[1] - start[1]) * Math.PI) / 180;
          const distance = Math.sqrt(distLat * distLat + distLng * distLng);

          // Determine curve intensity based on distance
          // Longer distances get more pronounced curves
          const curveIntensity = Math.min(0.5, Math.max(0.03, distance * 0.2));

          // Create multiple control points for a smoother curve
          const numPoints = 10; // Number of points along the curve
          const curvedPath: L.LatLngExpression[] = [];

          for (let j = 0; j <= numPoints; j++) {
            const t = j / numPoints;
            const tPrime = t * (2 - t); // Ease-out function for smoother movement

            // Linear interpolation for lat/lng
            let lat = start[0] + (end[0] - start[0]) * tPrime;
            let lng = start[1] + (end[1] - start[1]) * tPrime;

            // Apply curve based on distance from midpoint
            // Max curve at the middle of the path
            const curveAmount = Math.sin(Math.PI * tPrime) * curveIntensity;

            // Direction of curve depends on whether we're crossing the antimeridian
            const crossingAntimeridian = Math.abs(end[1] - start[1]) > 180;
            const curveFactor = crossingAntimeridian ? -1 : 1;

            // Calculate perpendicular offset for the curve
            // We use the perpendicular direction to the great circle path
            const perpLat = (end[1] - start[1]) * curveAmount * curveFactor;
            const perpLng = -(end[0] - start[0]) * curveAmount * curveFactor;

            // Apply the curve
            lat += perpLat;
            lng += perpLng;

            curvedPath.push([lat, lng] as L.LatLngExpression);
          }

          curvedPaths.push(curvedPath);
        }

        return curvedPaths;
      };

      const curvedPaths = createCurvedPath(routeCoordinates);

      // Create arrays to store path lines and active paths
      const pathLines: L.Polyline[] = [];
      const activePaths: L.Polyline[] = [];
      const completedPaths: L.Polyline[] = [];

      // Add CSS classes for tooltips and animation
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        .airport-code-tooltip {
          background: transparent;
          border: none;
          box-shadow: none;
          color: #FFFFFF;
          font-weight: bold;
          font-size: 10px;
          padding: 0;
        }
        .airport-code-tooltip::before {
          display: none;
        }
        
        .city-name-tooltip {
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid #CD9B1C;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          padding: 5px 10px;
          font-size: 12px;
          transition: opacity 0.5s ease;
        }
        
        /* SVG animation for circle markers */
        .leaflet-interactive.pulse-animation {
          transform-origin: center center;
          animation: pulseCity 0.5s ease-out forwards;
        }
        
        .leaflet-interactive.fade-animation {
          transform-origin: center center;
          animation: fadeCity 0.5s ease-in forwards;
        }
        
        @keyframes pulseCity {
          0% { transform: scale(1); }
          50% { transform: scale(5); }
          100% { transform: scale(5); }
        }
        
        @keyframes fadeCity {
          0% { transform: scale(5); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(styleElement);

      // Use a consistent color for all flight routes
      const flightPathColor = "#FF0000"; // Bright red for all routes

      // Draw all curved paths with dashed lines
      curvedPaths.forEach((path, index) => {
        // Draw initial dashed path
        const line = L.polyline(path, {
          color: flightPathColor,
          weight: 5, // Reduced to 5px as requested
          opacity: 0.25, // Reduced opacity for inactive paths
          smoothFactor: 1,
          dashArray: "10, 10", // Dashed line pattern
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current!);

        pathLines.push(line);

        // Create an empty active path (will be temporarily filled during animation)
        const activePath = L.polyline([], {
          color: flightPathColor,
          weight: 5, // Reduced to 5px as requested
          opacity: 0.6, // More visible for active segment
          smoothFactor: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current!);

        activePaths.push(activePath);

        // Create an empty completed path (will be filled as plane passes each segment)
        const completedPath = L.polyline([], {
          color: flightPathColor,
          weight: 5, // Reduced to 5px as requested
          opacity: 0.8, // High visibility for completed segments
          smoothFactor: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current!);

        completedPaths.push(completedPath);
      });

      // Initialize route animation variables
      let pathIndex = 0;
      let pointIndex = 0;
      const animationSpeed = 0.0075; // Increased speed by 0.5x
      const activeTail = 8; // Increased trail length for better visibility

      // Previous bearing for smooth rotation
      let previousBearing = 0;

      const animateRoute = () => {
        if (pathIndex < curvedPaths.length) {
          const currentPath = curvedPaths[pathIndex];

          if (pointIndex < currentPath.length) {
            // Get current point
            const currentPoint = currentPath[pointIndex] as [number, number];

            // Add current point to both active path and completed path
            activePaths[pathIndex].addLatLng(
              currentPoint as L.LatLngExpression
            );
            completedPaths[pathIndex].addLatLng(
              currentPoint as L.LatLngExpression
            );

            // Trim active path to keep only recent points (creates a trail effect behind plane)
            if (activePaths[pathIndex].getLatLngs().length > activeTail) {
              const latlngs = activePaths[pathIndex].getLatLngs() as L.LatLng[];
              activePaths[pathIndex].setLatLngs(
                latlngs.slice(latlngs.length - activeTail)
              );
            }

            // Check if plane is at a city position
            const cityCode = isAtCity(currentPoint);

            // Handle city animations
            if (cityCode && !animatedCities.has(cityCode)) {
              // We've reached a new city
              animatedCities.add(cityCode);

              // Animate the city marker (expand)
              const marker = cityMarkers[cityCode];
              if (marker) {
                try {
                  // Use direct SVG manipulation for Leaflet Circle Markers
                  const svgElement = marker.getElement();
                  if (svgElement) {
                    svgElement.classList.add("pulse-animation");
                  }

                  // Show city name tooltip at exact city position
                  const city = cities.find(c => c.code === cityCode);
                  if (city) {
                    cityLabels[cityCode]
                      .setLatLng(city.coordinates as L.LatLngExpression)
                      .addTo(mapRef.current!)
                      .setOpacity(1);
                  }
                } catch (error) {
                  console.error("Error animating city marker:", error);
                }
              }
            }
            // Check if we're leaving a city that was previously animated
            else if (!cityCode && animatedCities.size > 0) {
              // For each animated city, check if we're now far from it
              for (const animatedCityCode of Array.from(animatedCities)) {
                const city = cities.find((c) => c.code === animatedCityCode);
                if (city) {
                  const cityPos = city.coordinates;
                  const latDiff = currentPoint[0] - cityPos[0];
                  const lngDiff = currentPoint[1] - cityPos[1];
                  const distance = Math.sqrt(
                    latDiff * latDiff + lngDiff * lngDiff
                  );

                  // If we've moved away from this city
                  if (distance > 1.0) {
                    // Larger threshold for leaving
                    const marker = cityMarkers[animatedCityCode];
                    if (marker) {
                      try {
                        // Use direct SVG manipulation for Leaflet Circle Markers
                        const svgElement = marker.getElement();
                        if (svgElement) {
                          // Remove pulse animation and add fade animation
                          svgElement.classList.remove("pulse-animation");
                          svgElement.classList.add("fade-animation");

                          // After animation is complete, remove all classes
                          setTimeout(() => {
                            svgElement.classList.remove("fade-animation");
                          }, 500);
                        }

                        // Hide city name tooltip with fade
                        const tooltip = cityLabels[animatedCityCode];
                        if (tooltip) {
                          tooltip.setOpacity(0);

                          // Remove tooltip after fade
                          setTimeout(() => {
                            tooltip.remove();
                          }, 500);
                        }
                      } catch (error) {
                        console.error("Error resetting city marker:", error);
                      }
                    }

                    // Remove from animated cities set
                    animatedCities.delete(animatedCityCode);
                  }
                }
              }
            }

            // Calculate bearing for plane rotation
            // Look ahead to determine direction
            const nextPointIndex = Math.min(
              pointIndex + 2,
              currentPath.length - 1
            );
            const nextPoint = currentPath[nextPointIndex] as [number, number];
            const targetBearing = calculateBearing(currentPoint, nextPoint);

            // Apply smooth rotation transition (easing)
            let bearing;
            if (previousBearing === 0) {
              // First position - use target bearing directly
              bearing = targetBearing;
            } else {
              // Calculate shortest rotation path (handle 0/360 boundary)
              let diff = targetBearing - previousBearing;
              // Ensure we rotate the shortest way around the circle
              if (diff > 180) diff -= 360;
              if (diff < -180) diff += 360;

              // Apply smooth interpolation (take 500ms to complete rotation)
              // This creates a smoother, more gradual rotation
              const rotationSpeed = 0.1; // Controls rotation speed (0-1)
              bearing = previousBearing + diff * rotationSpeed;
            }

            // Store for next animation frame
            previousBearing = bearing;

            // Remove previous plane marker if exists
            if (planeMarker) {
              planeMarker.remove();
            }

            // Create new plane marker at current position with correct rotation
            planeMarker = L.marker(currentPoint as L.LatLngExpression, {
              icon: createPlaneIcon(bearing),
              zIndexOffset: 1000,
            }).addTo(mapRef.current!);

            // Increment point index
            pointIndex++;

            // If we've reached the end of the current path
            if (pointIndex >= currentPath.length) {
              // Complete the current active path
              if (pathIndex < curvedPaths.length - 1) {
                // If there's another path, prepare for it
                pathIndex++;
                pointIndex = 0;

                // Reset previous active path since we've completed it
                if (pathIndex > 0) {
                  // Clear the active path since it's represented by the completed path now
                  activePaths[pathIndex - 1].setLatLngs([]);

                  // Hide the original dashed path since we now have a completed solid path
                  if (pathLines[pathIndex - 1]) {
                    pathLines[pathIndex - 1].setStyle({
                      opacity: 0, // Hide the dashed path
                    });
                  }
                }
              }
            }

            // Continue animation with longer delay for slower movement
            setTimeout(() => requestAnimationFrame(animateRoute), 100); // Double the delay for half speed
          } else {
            // Move to next path
            pathIndex++;
            pointIndex = 0;

            if (pathIndex < curvedPaths.length) {
              requestAnimationFrame(animateRoute);
            }
          }
        }
      };

      // Start the animation
      animateRoute();

      return () => {
        // Clean up plane marker
        if (planeMarker) {
          planeMarker.remove();
        }

        // Clean up path lines
        pathLines.forEach((line) => {
          if (line) line.remove();
        });

        // Clean up active paths
        activePaths.forEach((path) => {
          if (path) path.remove();
        });

        // Clean up completed paths
        completedPaths.forEach((path) => {
          if (path) path.remove();
        });

        // Remove the added style element
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }

        // Clean up any remaining polylines when component unmounts
        if (mapRef.current) {
          mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
              layer.remove();
            }
          });
        }
      };
    }
  }, []);

  return <div id="map" className="w-full h-full absolute inset-0" />;
}
