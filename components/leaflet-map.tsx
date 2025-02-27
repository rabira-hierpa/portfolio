"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Plane } from "lucide-react"
import { createRoot } from "react-dom/client"

// Major international airport hubs
const cities = [
  { name: "Addis Ababa", coordinates: [9.0054, 38.7577], code: "ADD" },  // Bole International Airport
  { name: "Dubai", coordinates: [25.2528, 55.3644], code: "DXB" },      // Dubai International Airport
  { name: "Istanbul", coordinates: [41.2606, 28.7425], code: "IST" },   // Istanbul Airport
  { name: "London", coordinates: [51.4700, -0.4543], code: "LHR" },     // Heathrow Airport
  { name: "New York", coordinates: [40.6413, -73.7781], code: "JFK" },  // JFK International Airport
  { name: "Singapore", coordinates: [1.3644, 103.9915], code: "SIN" },  // Changi Airport
  { name: "Tokyo", coordinates: [35.7720, 140.3929], code: "NRT" },     // Narita International Airport
  { name: "Sydney", coordinates: [-33.9399, 151.1753], code: "SYD" },   // Sydney Airport
  { name: "Doha", coordinates: [25.2609, 51.6138], code: "DOH" },       // Hamad International Airport
]

// Flight routes based on common international connections
// These paths attempt to follow great circle routes which are the most fuel-efficient paths
// airlines typically use for long-haul flights
const flightRoutes = [
  // From Addis Ababa to Dubai (Ethiopian Airlines route)
  { from: "ADD", to: "DXB", coordinates: [
    [9.0054, 38.7577],  // Addis Ababa
    [12.8628, 42.9452], // Over Red Sea
    [15.3229, 44.2080], // Over Yemen
    [20.6843, 49.5703], // Over Saudi Arabia
    [25.2528, 55.3644]  // Dubai
  ]},
  // From Dubai to Istanbul (Emirates common route)
  { from: "DXB", to: "IST", coordinates: [
    [25.2528, 55.3644], // Dubai
    [27.9943, 50.3235], // Over Persian Gulf
    [32.7767, 44.5321], // Over Iraq
    [37.1526, 38.7839], // Over Turkey
    [41.2606, 28.7425]  // Istanbul
  ]},
  // From Istanbul to London (Turkish Airlines route)
  { from: "IST", to: "LHR", coordinates: [
    [41.2606, 28.7425], // Istanbul
    [44.7866, 20.4489], // Over Balkans
    [47.4979, 10.7743], // Over Alps
    [49.4542, 6.1699],  // Over Luxembourg
    [51.4700, -0.4543]  // London Heathrow
  ]},
  // From London to New York (Transatlantic route)
  { from: "LHR", to: "JFK", coordinates: [
    [51.4700, -0.4543],  // London
    [53.3498, -6.2603],  // Over Ireland
    [55.6761, -12.5683], // North Atlantic
    [52.3555, -35.8813], // Mid Atlantic
    [47.4501, -52.7787], // Near Newfoundland
    [45.5017, -62.6515], // Near Nova Scotia
    [42.3601, -71.0589], // Near Boston
    [40.6413, -73.7781]  // New York
  ]},
  // From New York to Tokyo (Polar route)
  { from: "JFK", to: "NRT", coordinates: [
    [40.6413, -73.7781], // New York
    [43.6532, -79.3832], // Over Canada
    [49.8951, -97.1384], // More Canada
    [60.7212, -135.0568], // Far North
    [64.5011, -165.4064], // Near Alaska
    [60.7077, 170.2871],  // Over Bering Sea
    [47.6740, 156.8859],  // Over Pacific
    [35.7720, 140.3929]   // Tokyo
  ]},
  // From Tokyo to Singapore (Common East Asian route)
  { from: "NRT", to: "SIN", coordinates: [
    [35.7720, 140.3929], // Tokyo
    [31.2304, 136.7015], // Over East China Sea
    [27.0645, 132.5488], // Southern Japan
    [22.5726, 128.9609], // Near Taiwan
    [16.8409, 120.2563], // Philippines
    [9.7489, 114.5703],  // South China Sea
    [1.3644, 103.9915]   // Singapore
  ]},
  // From Singapore to Sydney (Popular Australia route)
  { from: "SIN", to: "SYD", coordinates: [
    [1.3644, 103.9915],  // Singapore
    [-3.1190, 108.3984], // Over Indonesia
    [-8.4539, 115.2734], // Over Bali
    [-13.6243, 123.3984], // Over Timor Sea
    [-19.7327, 133.8750], // Over Northern Territory
    [-26.8341, 143.7891], // Over Queensland
    [-33.9399, 151.1753]  // Sydney
  ]},
  // From Sydney to Doha (Qatar Airways route)
  { from: "SYD", to: "DOH", coordinates: [
    [-33.9399, 151.1753], // Sydney
    [-28.5478, 138.0469], // Over Australia
    [-22.7359, 125.0684], // Western Australia
    [-15.1132, 112.5000], // Over Indian Ocean
    [-2.1088, 97.5586],   // Near Sumatra
    [9.7489, 80.7227],    // Near Sri Lanka
    [18.9793, 70.6641],   // Arabian Sea
    [25.2609, 51.6138]    // Doha
  ]},
  // From Doha to Addis Ababa (connecting back to first point)
  { from: "DOH", to: "ADD", coordinates: [
    [25.2609, 51.6138],  // Doha
    [19.9738, 48.8232],  // Over Saudi Arabia
    [15.4612, 44.1064],  // Over Yemen
    [11.6027, 42.3010],  // Gulf of Aden
    [9.0054, 38.7577]    // Addis Ababa
  ]}
]

// Extract all route coordinates for animation
const routeCoordinates = flightRoutes.flatMap(route => route.coordinates)

export function LeafletMap() {
  const mapRef = useRef<L.Map | null>(null)
  const routeRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!mapRef.current) {
        mapRef.current = L.map("map", {
          center: [20, 0],
          zoom: 2,
          zoomControl: false,
          attributionControl: false,
          worldCopyJump: true // Allows the map to pan across the 180th meridian
        })

        // Use a more neutral map style
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapRef.current)

        // Add airport markers with airport codes
        cities.forEach((city) => {
          // Create airport marker
          const marker = L.circleMarker(city.coordinates as L.LatLngExpression, {
            radius: 4,
            fillColor: "#CD9B1C",
            color: "#CD9B1C",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapRef.current!)
          
          // Add airport code tooltip
          marker.bindTooltip(city.code, {
            permanent: true,
            direction: 'center',
            className: 'airport-code-tooltip'
          })
        })

        routeRef.current = L.polyline([], {
          color: "#FF0000",
          weight: 3,
          opacity: 0.7,
          dashArray: "10, 10",
          lineCap: "round",
        }).addTo(mapRef.current)
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && routeRef.current) {
      let currentIndex = 0
      let planeMarker: L.Marker | null = null
      
      // Remove existing polyline and create a new one with curved options
      if (routeRef.current) {
        routeRef.current.remove()
      }
      
      // Helper function to calculate bearing between two points
      const calculateBearing = (start: [number, number], end: [number, number]): number => {
        const startLat = start[0] * Math.PI / 180
        const startLng = start[1] * Math.PI / 180
        const endLat = end[0] * Math.PI / 180
        const endLng = end[1] * Math.PI / 180
        
        const y = Math.sin(endLng - startLng) * Math.cos(endLat)
        const x = Math.cos(startLat) * Math.sin(endLat) -
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)
        const bearing = Math.atan2(y, x) * 180 / Math.PI
        
        return (bearing + 360) % 360
      }
      
      const createPlaneIcon = (rotation: number) => {
        const planeIconDiv = document.createElement('div')
        planeIconDiv.className = 'plane-icon'
        const root = createRoot(planeIconDiv)
        root.render(<Plane size={24} className="text-primary" style={{ transform: `rotate(${rotation}deg)` }} />)
        
        return L.divIcon({
          html: planeIconDiv,
          className: 'plane-icon-container',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }
      
      // Create curved path between points with more control points for smoother curves
      const createCurvedPath = (points: [number, number][]) => {
        const curvedPaths: L.LatLngExpression[][] = []
        
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i]
          const end = points[i + 1]
          
          // Calculate the great circle distance between points
          const distLat = (end[0] - start[0]) * Math.PI / 180
          const distLng = (end[1] - start[1]) * Math.PI / 180
          const distance = Math.sqrt(distLat * distLat + distLng * distLng)
          
          // Determine curve intensity based on distance
          // Longer distances get more pronounced curves
          const curveIntensity = Math.min(0.5, Math.max(0.03, distance * 0.2))
          
          // Create multiple control points for a smoother curve
          const numPoints = 10 // Number of points along the curve
          const curvedPath: L.LatLngExpression[] = []
          
          for (let j = 0; j <= numPoints; j++) {
            const t = j / numPoints
            const tPrime = t * (2 - t) // Ease-out function for smoother movement
            
            // Linear interpolation for lat/lng
            let lat = start[0] + (end[0] - start[0]) * tPrime
            let lng = start[1] + (end[1] - start[1]) * tPrime
            
            // Apply curve based on distance from midpoint
            // Max curve at the middle of the path
            const curveAmount = Math.sin(Math.PI * tPrime) * curveIntensity
            
            // Direction of curve depends on whether we're crossing the antimeridian
            const crossingAntimeridian = Math.abs(end[1] - start[1]) > 180
            const curveFactor = crossingAntimeridian ? -1 : 1
            
            // Calculate perpendicular offset for the curve
            // We use the perpendicular direction to the great circle path
            const perpLat = (end[1] - start[1]) * curveAmount * curveFactor
            const perpLng = -(end[0] - start[0]) * curveAmount * curveFactor
            
            // Apply the curve
            lat += perpLat
            lng += perpLng
            
            curvedPath.push([lat, lng] as L.LatLngExpression)
          }
          
          curvedPaths.push(curvedPath)
        }
        
        return curvedPaths
      }
      
      const curvedPaths = createCurvedPath(routeCoordinates)
      
      // Create arrays to store path lines and active paths
      const pathLines: L.Polyline[] = []
      const activePaths: L.Polyline[] = []
      
      // Add a CSS class for the airport code tooltips
      const styleElement = document.createElement('style')
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
      `
      document.head.appendChild(styleElement)
      
      // Draw all curved paths with reduced opacity
      curvedPaths.forEach((path, index) => {
        const routeInfo = flightRoutes[Math.floor(index / path.length)] || flightRoutes[0]
        const routeColor = getRouteColor(routeInfo.from)
        
        // Draw path with very low opacity
        const line = L.polyline(path, {
          color: routeColor,
          weight: 2,
          opacity: 0.06,
          smoothFactor: 1,
          dashArray: '5, 10',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current!)
        
        pathLines.push(line)
        
        // Create an empty active path (will be filled during animation)
        const activePath = L.polyline([], {
          color: routeColor,
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current!)
        
        activePaths.push(activePath)
      })
      
      // Function to get a consistent color for each route based on airport code
      function getRouteColor(airportCode: string): string {
        // Maps airport codes to distinct colors
        const colorMap: {[key: string]: string} = {
          'ADD': '#FF3B30', // Red
          'DXB': '#FF9500', // Orange
          'IST': '#FFCC00', // Yellow
          'LHR': '#4CD964', // Green
          'JFK': '#5AC8FA', // Blue
          'NRT': '#007AFF', // Deep Blue
          'SIN': '#5856D6', // Purple
          'SYD': '#FF2D55', // Pink
          'DOH': '#E5C39E'  // Gold
        }
        
        return colorMap[airportCode] || '#FF0000' // Default to red
      }
      
      // Initialize route animation variables
      let pathIndex = 0
      let pointIndex = 0
      const animationSpeed = 0.005 // Reduced speed by half for slower animation
      const activeTail = 8 // Increased trail length for better visibility
      
      // Previous bearing for smooth rotation
      let previousBearing = 0
      
      const animateRoute = () => {
        if (pathIndex < curvedPaths.length) {
          const currentPath = curvedPaths[pathIndex]
          
          if (pointIndex < currentPath.length) {
            // Get current point
            const currentPoint = currentPath[pointIndex] as [number, number]
            
            // Add current point to active path
            activePaths[pathIndex].addLatLng(currentPoint as L.LatLngExpression)
            
            // Trim active path to keep only recent points (creates a trail effect)
            if (activePaths[pathIndex].getLatLngs().length > activeTail) {
              const latlngs = activePaths[pathIndex].getLatLngs() as L.LatLng[]
              activePaths[pathIndex].setLatLngs(latlngs.slice(latlngs.length - activeTail))
            }
            
            // Calculate bearing for plane rotation
            // Look ahead to determine direction
            const nextPointIndex = Math.min(pointIndex + 2, currentPath.length - 1)
            const nextPoint = currentPath[nextPointIndex] as [number, number]
            const targetBearing = calculateBearing(currentPoint, nextPoint)
            
            // Apply smooth rotation transition (easing)
            let bearing
            if (previousBearing === 0) {
              // First position - use target bearing directly
              bearing = targetBearing
            } else {
              // Calculate shortest rotation path (handle 0/360 boundary)
              let diff = targetBearing - previousBearing
              // Ensure we rotate the shortest way around the circle
              if (diff > 180) diff -= 360
              if (diff < -180) diff += 360
              
              // Apply smooth interpolation (take 500ms to complete rotation)
              // This creates a smoother, more gradual rotation
              const rotationSpeed = 0.1 // Controls rotation speed (0-1)
              bearing = previousBearing + (diff * rotationSpeed)
            }
            
            // Store for next animation frame
            previousBearing = bearing
            
            // Remove previous plane marker if exists
            if (planeMarker) {
              planeMarker.remove()
            }
            
            // Create new plane marker at current position with correct rotation
            planeMarker = L.marker(currentPoint as L.LatLngExpression, {
              icon: createPlaneIcon(bearing),
              zIndexOffset: 1000
            }).addTo(mapRef.current!)
            
            // Increment point index
            pointIndex++
            
            // If we've reached the end of the current path
            if (pointIndex >= currentPath.length) {
              // Complete the current active path
              if (pathIndex < curvedPaths.length - 1) {
                // If there's another path, prepare for it
                pathIndex++
                pointIndex = 0
                
                // Reset previous active path (so it doesn't grow indefinitely)
                if (pathIndex > 0) {
                  // Keep the last active path but make it slightly transparent
                  activePaths[pathIndex - 1].setStyle({
                    opacity: 0.4,
                    dashArray: null,
                    weight: 2.5
                  })
                }
              }
            }
            
            // Continue animation with longer delay for slower movement
            setTimeout(() => requestAnimationFrame(animateRoute), 100) // Double the delay for half speed
          } else {
            // Move to next path
            pathIndex++
            pointIndex = 0
            
            if (pathIndex < curvedPaths.length) {
              requestAnimationFrame(animateRoute)
            }
          }
        }
      }
      
      // Start the animation
      animateRoute()
      
      return () => {
        // Clean up plane marker
        if (planeMarker) {
          planeMarker.remove()
        }
        
        // Clean up path lines
        pathLines.forEach(line => {
          if (line) line.remove()
        })
        
        // Clean up active paths
        activePaths.forEach(path => {
          if (path) path.remove()
        })
        
        // Clean up any remaining polylines when component unmounts
        if (mapRef.current) {
          mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
              layer.remove()
            }
          })
        }
      }
    }
  }, [])

  return <div id="map" className="w-full h-full absolute inset-0" />
}

