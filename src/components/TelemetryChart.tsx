interface DataPoint {
  label: string
  value: number
}

interface TelemetryChartProps {
  points: DataPoint[]
  unit: string
  ariaLabel: string
}

export function TelemetryChart({ points, unit, ariaLabel }: TelemetryChartProps) {
  const safePoints = points.length >= 2 ? points : [
    { label: '08h', value: 18 },
    { label: '10h', value: 32 },
    { label: '12h', value: 14 },
    { label: '14h', value: 58 },
    { label: '16h', value: 44 },
    { label: '18h', value: 72 },
    { label: '20h', value: 39 },
  ]

  const width = 620
  const height = 190
  const padX = 28
  const padY = 24
  const maxVal = Math.max(...safePoints.map((p) => p.value), 10)
  const minVal = 0

  const coords = safePoints.map((pt, i) => {
    const x = padX + (i / (safePoints.length - 1)) * (width - padX * 2)
    const ratio = (pt.value - minVal) / (maxVal - minVal || 1)
    const y = height - padY - ratio * (height - padY * 2)
    return { ...pt, x, y }
  })

  const polyline = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')

  return (
    <div className="chart-box">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="none"
      >
        {/* Linhas guia sutis */}
        {[0.25, 0.5, 0.75].map((r) => {
          const y = padY + r * (height - padY * 2)
          return (
            <line
              key={r}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          )
        })}

        {/* Linha principal nítida (adaptada ao tema ativo) */}
        <polyline
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />

        {/* Pontos de leitura */}
        {coords.map((c, idx) => (
          <g key={`${c.label}-${idx}`}>
            <circle
              cx={c.x}
              cy={c.y}
              r="3.4"
              fill="var(--chart-line)"
              stroke="var(--bg-recessed)"
              strokeWidth="1.5"
            >
              <title>{`${c.label}: ${c.value}${unit}`}</title>
            </circle>
            <text
              x={c.x}
              y={height - 4}
              textAnchor="middle"
              fill="var(--ink-subtle)"
              fontSize="11"
              fontFamily="Inter, sans-serif"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
