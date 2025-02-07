"use client"

import { useEffect, useRef } from "react"

interface City {
  name: string
  lat: number
  lng: number
}

export function AnimatedMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const cities: City[] = [
    { name: "Addis Ababa", lat: 9.032, lng: 38.7422 },
    { name: "Dubai", lat: 25.2048, lng: 55.2708 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "New York", lat: 40.7128, lng: -74.006 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const mapWidth = canvas.width
    const mapHeight = canvas.height
    const points = cities.map((city) => ({
      x: ((city.lng + 180) * mapWidth) / 360,
      y: ((90 - city.lat) * mapHeight) / 180,
    }))

    let progress = 0
    let currentPath = 0

    const drawRoute = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw world map outline (simplified)
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      // Add basic continent outlines here
      ctx.stroke()

      // Draw all cities
      points.forEach((point, i) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#CD9B1C"
        ctx.fill()

        // City name
        ctx.font = "12px Inter"
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.textAlign = "center"
        ctx.fillText(cities[i].name, point.x, point.y - 10)
      })

      // Draw completed routes
      for (let i = 0; i < currentPath; i++) {
        ctx.beginPath()
        ctx.moveTo(points[i].x, points[i].y)
        ctx.lineTo(points[i + 1].x, points[i + 1].y)
        ctx.strokeStyle = "rgba(205, 155, 28, 0.5)"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw current animated route
      if (currentPath < points.length - 1) {
        const start = points[currentPath]
        const end = points[currentPath + 1]
        const x = start.x + (end.x - start.x) * progress
        const y = start.y + (end.y - start.y) * progress

        // Draw dashed line for route
        ctx.beginPath()
        ctx.setLineDash([5, 5])
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "#CD9B1C"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.setLineDash([])

        // Animate moving dot
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = "#CD9B1C"
        ctx.fill()

        // Glowing effect
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(205, 155, 28, 0.3)"
        ctx.fill()

        progress += 0.003
        if (progress >= 1) {
          progress = 0
          currentPath++
          if (currentPath >= points.length - 1) {
            currentPath = 0
          }
        }
      }

      requestAnimationFrame(drawRoute)
    }

    drawRoute()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-50" />
}

