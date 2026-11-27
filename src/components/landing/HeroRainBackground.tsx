import { useEffect, useRef } from 'react'

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  width: number
  alpha: number
  layer: 0 | 1 | 2
}

interface Splash {
  x: number
  y: number
  r: number
  maxR: number
  alpha: number
}

export function HeroRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let rafId = 0
    let inView = true
    let lastTime = 0
    let drops: Drop[] = []
    let splashes: Splash[] = []

    const createDrop = (layer: 0 | 1 | 2, randomY: boolean): Drop => {
      if (layer === 0) {
        return {
          x: Math.random() * (width + 180) - 90,
          y: randomY ? Math.random() * height : -30 - Math.random() * 120,
          len: 14 + Math.random() * 16,
          speed: 9 + Math.random() * 5,
          width: 0.75,
          alpha: 0.1 + Math.random() * 0.12,
          layer,
        }
      }
      if (layer === 1) {
        return {
          x: Math.random() * (width + 220) - 110,
          y: randomY ? Math.random() * height : -60 - Math.random() * 160,
          len: 28 + Math.random() * 26,
          speed: 16 + Math.random() * 7,
          width: 1.15,
          alpha: 0.2 + Math.random() * 0.16,
          layer,
        }
      }
      return {
        x: Math.random() * (width + 260) - 130,
        y: randomY ? Math.random() * height : -90 - Math.random() * 200,
        len: 54 + Math.random() * 34,
        speed: 25 + Math.random() * 9,
        width: 1.55,
        alpha: 0.3 + Math.random() * 0.22,
        layer,
      }
    }

    const seed = () => {
      const scaleFactor = Math.min(1.4, Math.max(0.55, width / 1280))
      const farCount = Math.round(70 * scaleFactor)
      const midCount = Math.round(60 * scaleFactor)
      const nearCount = Math.round(24 * scaleFactor)

      drops = [
        ...Array.from({ length: farCount }, () => createDrop(0, true)),
        ...Array.from({ length: midCount }, () => createDrop(1, true)),
        ...Array.from({ length: nearCount }, () => createDrop(2, true)),
      ]
      splashes = []
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true
        inView = visible
        if (inView && !rafId) {
          lastTime = performance.now()
          rafId = window.requestAnimationFrame(tick)
        }
      },
      { threshold: 0.02 }
    )
    observer.observe(canvas)

    const tick = (now: number) => {
      rafId = 0
      if (!inView) return

      const dt = Math.min(2.2, Math.max(0.4, (now - lastTime) / 16.667))
      lastTime = now

      ctx.clearRect(0, 0, width, height)

      // Inclinação orgânica de vento suave (~10°–12°) alinhada à foto do hero
      const windFactor = -0.19 + Math.sin(now * 0.00045) * 0.03

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        const dx = d.len * windFactor
        const dy = d.len

        const grad = ctx.createLinearGradient(d.x, d.y, d.x + dx, d.y + dy)
        if (d.layer === 2) {
          grad.addColorStop(0, 'rgba(15, 145, 254, 0)')
          grad.addColorStop(0.65, `rgba(108, 192, 255, ${(d.alpha * 0.7).toFixed(3)})`)
          grad.addColorStop(1, `rgba(205, 236, 255, ${d.alpha.toFixed(3)})`)
        } else if (d.layer === 1) {
          grad.addColorStop(0, 'rgba(15, 145, 254, 0)')
          grad.addColorStop(0.6, `rgba(15, 145, 254, ${(d.alpha * 0.65).toFixed(3)})`)
          grad.addColorStop(1, `rgba(140, 212, 255, ${d.alpha.toFixed(3)})`)
        } else {
          grad.addColorStop(0, 'rgba(15, 145, 254, 0)')
          grad.addColorStop(1, `rgba(108, 192, 255, ${d.alpha.toFixed(3)})`)
        }

        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + dx, d.y + dy)
        ctx.strokeStyle = grad
        ctx.lineWidth = d.width
        ctx.lineCap = 'round'
        ctx.stroke()

        d.x += d.speed * windFactor * dt
        d.y += d.speed * dt

        if (d.y > height + 24) {
          // Pequeno respingo sutil no asfalto molhado para gotas em primeiro/médio plano
          if (d.layer >= 1 && splashes.length < 28 && Math.random() < 0.22) {
            splashes.push({
              x: d.x,
              y: height - 6 - Math.random() * 28,
              r: 1.5,
              maxR: d.layer === 2 ? 12 + Math.random() * 8 : 7 + Math.random() * 5,
              alpha: d.layer === 2 ? 0.34 : 0.2,
            })
          }
          drops[i] = createDrop(d.layer, false)
        }
      }

      // Micro-ondas/respingos sutis na base molhada do cenário
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i]
        ctx.beginPath()
        ctx.ellipse(s.x, s.y, s.r, s.r * 0.3, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(108, 192, 255, ${s.alpha.toFixed(3)})`
        ctx.lineWidth = 0.9
        ctx.stroke()

        s.r += 0.42 * dt
        s.alpha *= Math.pow(0.91, dt)
        if (s.r >= s.maxR || s.alpha < 0.015) {
          splashes.splice(i, 1)
        }
      }

      rafId = window.requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    lastTime = performance.now()
    rafId = window.requestAnimationFrame(tick)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return <canvas ref={canvasRef} className="lp-hero-rain" aria-hidden="true" />
}
