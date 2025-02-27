"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Plane } from "lucide-react"
import { createRoot } from "react-dom/client"

const cities = [
  { name: "Addis Ababa", coordinates: [9.032, 38.7422] },
  { name: "Islamabad", coordinates: [33.6844, 73.0479] },
  { name: "London", coordinates: [51.5074, -0.1278] },
  { name: "New York", coordinates: [40.7128, -74.006] },
  { name: "Kyiv", coordinates: [50.4501, 30.5234] },
  { name: "Copenhagen", coordinates: [55.6761, 12.5683] },
  { name: "Hong Kong", coordinates: [22.3193, 114.1694] },
  { name: "Sydney", coordinates: [-33.8688, 151.2093] },
  { name: "Dubai", coordinates: [25.2048, 55.2708] },
]

const routeCoordinates = [
  [9.032, 38.7422],
  [33.6844, 73.0479],
  [51.5074, -0.1278],
  [40.7128, -74.006],
  [50.4501, 30.5234],
  [55.6761, 12.5683],
  [22.3193, 114.1694],
  [-33.8688, 151.2093],
  [25.2048, 55.2708],
]

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
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapRef.current)

        cities.forEach((city) => {
          L.circleMarker(city.coordinates as L.LatLngExpression, {
            radius: 5,
            fillColor: "#CD9B1C",
            color: "#CD9B1C",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapRef.current!)
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
      
      // Draw all curved paths with reduced opacity
      curvedPaths.forEach((path, index) => {
        const line = L.polyline(path, {
          color: '#FF0000',
          weight: 2,
          opacity: 0.1,
          smoothFactor: 1,
          dashArray: '5, 10',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current!)
        
        pathLines.push(line)
        
        // Create an empty active path (will be filled during animation)
        const activePath = L.polyline([], {
          color: '#FF0000',
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current!)
        
        activePaths.push(activePath)
      })
      
      // Initialize route animation variables
      let pathIndex = 0
      let pointIndex = 0
      const animationSpeed = 0.01 // Adjust speed for smoother animation
      const activeTail = 5 // Number of points to keep active in the trail
      
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
            const bearing = calculateBearing(currentPoint, nextPoint)
            
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
            
            // Continue animation
            setTimeout(() => requestAnimationFrame(animateRoute), 50) // Add small delay for more visible animation
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

