import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface Props {
  color: string
  size: number
  onStrokeStart?: () => void
}

export interface CanvasHandle {
  clear: () => void
}

/**
 * A blank, pressure-free drawing surface. Resolution is locked to the
 * element's rendered size (× devicePixelRatio) so strokes stay crisp on
 * mobile. Drawing state lives entirely in the canvas bitmap.
 */
export const DrawingCanvas = forwardRef<CanvasHandle, Props>(function DrawingCanvas(
  { color, size, onStrokeStart },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  useImperativeHandle(ref, () => ({
    clear() {
      const c = canvasRef.current
      const ctx = c?.getContext('2d')
      if (c && ctx) ctx.clearRect(0, 0, c.width, c.height)
    },
  }))

  // Keep the bitmap matched to the CSS size for sharp lines.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      // Preserve existing drawing across resizes.
      const snapshot = canvas.toDataURL()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
        img.src = snapshot
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
    // A tap should leave a dot.
    draw(e)
    onStrokeStart?.()
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const p = pos(e)
    const from = last.current ?? p
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      onPointerDown={start}
      onPointerMove={draw}
      onPointerUp={end}
      onPointerLeave={end}
    />
  )
})
