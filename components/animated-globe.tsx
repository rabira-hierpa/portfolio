"use client"

import { useEffect, useRef } from "react"

export function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let frame = 0
    const dots: { x: number; y: number; speed: number }[] = []

    // Create initial dots
    for (let i = 0; i < 100; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.2 + Math.random() * 0.5,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
      dots.forEach((dot, i) => {
        dots.forEach((otherDot, j) => {
          if (i !== j) {
            const distance = Math.hypot(dot.x - otherDot.x, dot.y - otherDot.y)
            if (distance < 100) {
              ctx.moveTo(dot.x, dot.y)
              ctx.lineTo(otherDot.x, otherDot.y)
            }
          }
        })
      })
      ctx.stroke()

      // Update and draw dots
      dots.forEach((dot) => {
        dot.x += dot.speed
        if (dot.x > canvas.width) dot.x = 0

        ctx.beginPath()
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2)
        ctx.fill()
      })

      frame = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30" />
}

