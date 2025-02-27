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
      
      const createPlaneIcon = () => {
        const planeIconDiv = document.createElement('div')
        planeIconDiv.className = 'plane-icon'
        const root = createRoot(planeIconDiv)
        root.render(<Plane size={24} className="text-primary" style={{ transform: 'rotate(45deg)' }} />)
        
        return L.divIcon({
          html: planeIconDiv,
          className: 'plane-icon-container',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }
      
      const animateRoute = () => {
        if (currentIndex < routeCoordinates.length) {
          // Add point to the route path
          routeRef.current!.addLatLng(routeCoordinates[currentIndex] as L.LatLngExpression)
          
          // Calculate rotation angle for the plane
          const nextIndex = currentIndex + 1 < routeCoordinates.length ? currentIndex + 1 : currentIndex
          const currentPos = routeCoordinates[currentIndex]
          const nextPos = routeCoordinates[nextIndex]
          
          // Remove previous plane marker if exists
          if (planeMarker) {
            planeMarker.remove()
          }
          
          // Create new plane marker at current position
          planeMarker = L.marker(currentPos as L.LatLngExpression, {
            icon: createPlaneIcon(),
            zIndexOffset: 1000
          }).addTo(mapRef.current!)
          
          currentIndex++
          setTimeout(animateRoute, 1000)
        }
      }
      
      animateRoute()
      
      return () => {
        if (planeMarker) {
          planeMarker.remove()
        }
      }
    }
  }, [])

  return <div id="map" className="w-full h-full absolute inset-0" />
}

