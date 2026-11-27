import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

interface RainDrop {
  x: number
  y: number
  len: number
  speed: number
  alpha: number
}

export function RainRadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [paused, setPaused] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let rafId = 0
    let drops: RainDrop[] = []
    let pulsePhase = 0

    const seedDrops = () => {
      const count = Math.min(64, Math.max(24, Math.floor(width / 24)))
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 14 + Math.random() * 24,
        speed: 4.5 + Math.random() * 5.5,
        alpha: 0.1 + Math.random() * 0.22,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedDrops()
    }

    const drawFrame = (advance: boolean) => {
      ctx.clearRect(0, 0, width, height)

      // Anel sutil de telemetria sobre a metade direita (onde paira o drone)
      const cx = width >= 1024 ? width * 0.72 : width * 0.5
      const cy = width >= 1024 ? height * 0.46 : height * 0.48
      const maxR = Math.min(width, height) * 0.34

      for (let i = 0; i < 2; i++) {
        const p = (pulsePhase + i * 0.5) % 1
        const r = 48 + p * maxR
        const alpha = (1 - p) * 0.18
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(15, 145, 254, ${alpha.toFixed(3)})`
        ctx.lineWidth = 1.25
        ctx.stroke()
      }

      // Traços de chuva finos em azul elétrico
      ctx.lineWidth = 1
      for (const drop of drops) {
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x - drop.len * 0.16, drop.y + drop.len)
        ctx.strokeStyle = `rgba(140, 212, 255, ${drop.alpha.toFixed(3)})`
        ctx.stroke()

        if (advance) {
          drop.y += drop.speed
          drop.x -= drop.speed * 0.16
          if (drop.y > height + 30) {
            drop.y = -drop.len
            drop.x = Math.random() * (width + 80)
          }
        }
      }

      if (advance) {
        pulsePhase = (pulsePhase + 0.004) % 1
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (paused || reducedMotion) {
      drawFrame(false)
      return () => {
        window.removeEventListener('resize', resize)
      }
    }

    const tick = () => {
      drawFrame(true)
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [paused])

  return (
    <>
      <canvas ref={canvasRef} className="lp-rain-canvas" aria-hidden="true" />
      <button
        type="button"
        className="loop-pause"
        aria-pressed={paused}
        aria-label={paused ? 'Reproduzir movimento de chuva' : 'Pausar movimento de chuva'}
        title={paused ? 'Reproduzir animação' : 'Pausar animação'}
        onClick={() => setPaused((prev) => !prev)}
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </>
  )
}
