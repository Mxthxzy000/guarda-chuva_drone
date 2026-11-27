import { useState } from 'react'

type WeatherKey = 'moderada' | 'forte' | 'vento'

interface WeatherPreset {
  key: WeatherKey
  label: string
  status: string
  rainPct: number
  windDeg: number
  distanceCm: number
  canopy: string
  suspended: boolean
}

const PRESETS: WeatherPreset[] = [
  {
    key: 'moderada',
    label: 'Chuva leve',
    status: 'Em atendimento',
    rainPct: 58,
    windDeg: 12,
    distanceCm: 54,
    canopy: '180°',
    suspended: false,
  },
  {
    key: 'forte',
    label: 'Chuva forte',
    status: 'Em atendimento',
    rainPct: 86,
    windDeg: 21,
    distanceCm: 48,
    canopy: '180°',
    suspended: false,
  },
  {
    key: 'vento',
    label: 'Vento > 30°',
    status: 'Voo suspenso',
    rainPct: 74,
    windDeg: 34,
    distanceCm: 60,
    canopy: '0°',
    suspended: true,
  },
]

interface LiveTelemetryMockProps {
  activeStep: number
}

export function LiveTelemetryMock({ activeStep }: LiveTelemetryMockProps) {
  const [selectedKey, setSelectedKey] = useState<WeatherKey>('moderada')
  const preset = PRESETS.find((item) => item.key === selectedKey) ?? PRESETS[0]

  const stepLabel =
    activeStep === 0
      ? 'Praça da Matriz · 20 min'
      : activeStep === 1
        ? 'Drone A04 · Aproximando'
        : 'Acompanhamento ativo'

  const windRatio = Math.min(1, preset.windDeg / 40)
  const barWidth = Math.round(windRatio * 480)
  const strokeColor = preset.suspended ? '#f59e0b' : '#0f91fe'

  return (
    <div className="lp-telemetry-frame" data-ui="telemetry" aria-label="Telemetria Aeropia">
      <div className="lp-telemetry-ui">
        <div className="lp-ui-header">
          <div className="lp-ui-status">
            <span
              className={`lp-ui-dot${preset.suspended ? ' is-alert' : ''}`}
              aria-hidden="true"
            />
            <span>{stepLabel}</span>
          </div>
          <span className={`lp-ui-state-text${preset.suspended ? ' is-alert' : ''}`}>
            {preset.status}
          </span>
        </div>

        <div className="tabs" role="tablist" aria-label="Simulação climática">
          {PRESETS.map((item) => {
            const selected = item.key === preset.key
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                className="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setSelectedKey(item.key)}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="lp-ui-readout-grid">
          <div className="lp-ui-stat">
            <span className="lp-ui-stat-k">Distância</span>
            <span className="lp-ui-stat-v">{preset.distanceCm} cm</span>
          </div>
          <div className="lp-ui-stat">
            <span className="lp-ui-stat-k">Chuva</span>
            <span className="lp-ui-stat-v">{preset.rainPct}%</span>
          </div>
          <div className="lp-ui-stat">
            <span className="lp-ui-stat-k">Vento</span>
            <span className="lp-ui-stat-v">{preset.windDeg}°</span>
          </div>
          <div className="lp-ui-stat">
            <span className="lp-ui-stat-k">Cobertura</span>
            <span className="lp-ui-stat-v">{preset.canopy}</span>
          </div>
        </div>

        <div className="lp-ui-svg-wrap">
          <svg
            viewBox="0 0 520 112"
            role="img"
            aria-label={`Curva de estabilidade do vento em ${preset.windDeg} graus`}
          >
            <line x1="16" y1="24" x2="504" y2="24" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="16" y1="54" x2="504" y2="54" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <path
              d="M 16 64 Q 90 22, 172 52 T 334 40 T 504 38"
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="2"
            />
            <path
              d={
                preset.suspended
                  ? 'M 16 68 Q 95 14, 175 76 T 340 20 T 504 72'
                  : 'M 16 56 Q 95 44, 175 52 T 340 46 T 504 48'
              }
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect x="16" y="96" width="480" height="6" rx="3" fill="#1f2125" />
            <rect x="16" y="96" width={barWidth} height="6" rx="3" fill={strokeColor} />
          </svg>
        </div>
      </div>
    </div>
  )
}
