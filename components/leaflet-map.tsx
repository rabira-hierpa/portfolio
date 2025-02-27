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
      
      // Create curved path between points
      const createCurvedPath = (points: [number, number][]) => {
        const curvedPaths: L.LatLngExpression[][] = []
        
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i]
          const end = points[i + 1]
          
          // Calculate midpoint and offset it to create a curve
          const midLat = (start[0] + end[0]) / 2
          const midLng = (start[1] + end[1]) / 2
          
          // Add a slight offset to create a curved path
          const latDiff = end[0] - start[0]
          const lngDiff = end[1] - start[1]
          const offset = 0.02 // Adjust this value to change the curve amount
          
          // Create a curved path by offsetting the midpoint
          const curvedMidLat = midLat + (lngDiff * offset)
          const curvedMidLng = midLng - (latDiff * offset)
          
          // Create path with control point
          curvedPaths.push([
            [start[0], start[1]],
            [curvedMidLat, curvedMidLng],
            [end[0], end[1]]
          ] as L.LatLngExpression[])
        }
        
        return curvedPaths
      }
      
      const curvedPaths = createCurvedPath(routeCoordinates)
      
      // Draw initial curved paths with reduced opacity
      curvedPaths.forEach((path, index) => {
        L.polyline(path, {
          color: '#FF0000',
          weight: 2,
          opacity: 0.3,
          smoothFactor: 1,
          dashArray: '5, 10',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current!)
      })
      
      // Initialize route animation with a position along the path
      let pathIndex = 0
      let segmentIndex = 0
      let progress = 0
      const animationSpeed = 0.02 // Adjust speed
      
      const animateRoute = () => {
        if (pathIndex < curvedPaths.length) {
          const currentPath = curvedPaths[pathIndex]
          
          if (segmentIndex < currentPath.length - 1) {
            // Get current segment points
            const p1 = currentPath[segmentIndex] as [number, number]
            const p2 = currentPath[segmentIndex + 1] as [number, number]
            
            // Calculate position along the segment using progress
            const lat = p1[0] + (p2[0] - p1[0]) * progress
            const lng = p1[1] + (p2[1] - p1[1]) * progress
            const currentPos: [number, number] = [lat, lng]
            
            // Calculate bearing for plane rotation
            const nextPos = segmentIndex < currentPath.length - 2 
              ? currentPath[segmentIndex + 2] as [number, number] 
              : (pathIndex < curvedPaths.length - 1 
                ? curvedPaths[pathIndex + 1][0] as [number, number] 
                : currentPath[segmentIndex + 1] as [number, number])
            
            const bearing = calculateBearing(currentPos, nextPos)
            
            // Remove previous plane marker if exists
            if (planeMarker) {
              planeMarker.remove()
            }
            
            // Create new plane marker at current position with correct rotation
            planeMarker = L.marker(currentPos as L.LatLngExpression, {
              icon: createPlaneIcon(bearing),
              zIndexOffset: 1000
            }).addTo(mapRef.current!)
            
            // Increment progress
            progress += animationSpeed
            
            // Move to next segment if progress is complete
            if (progress >= 1) {
              segmentIndex++
              progress = 0
              
              // Move to next path if current path is complete
              if (segmentIndex >= currentPath.length - 1) {
                pathIndex++
                segmentIndex = 0
              }
            }
            
            // Continue animation
            requestAnimationFrame(animateRoute)
          } else {
            // Move to next path
            pathIndex++
            segmentIndex = 0
            progress = 0
            
            if (pathIndex < curvedPaths.length) {
              requestAnimationFrame(animateRoute)
            }
          }
        }
      }
      
      // Start the animation
      animateRoute()
      
      return () => {
        if (planeMarker) {
          planeMarker.remove()
        }
        
        // Clean up all polylines when component unmounts
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

