interface SocialButtonsProps {
  onSelectProvider: (provider: string) => void
}

export function SocialButtons({ onSelectProvider }: SocialButtonsProps) {
  return (
    <div className="social-row" role="group" aria-label="Acesso com provedores externos">
      <button
        type="button"
        className="social-circle"
        aria-label="Continuar com Google"
        onClick={() => onSelectProvider('Google')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.48-1.71 4.35-5.27 4.35-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.79 4.2 14.69 3.3 12.17 3.3 7.21 3.3 3.2 7.31 3.2 12.28s4.01 8.98 8.97 8.98c5.18 0 8.61-3.64 8.61-8.77 0-.59-.06-1.04-.15-1.39Z"
          />
        </svg>
      </button>

      <button
        type="button"
        className="social-circle"
        aria-label="Continuar com Facebook"
        onClick={() => onSelectProvider('Facebook')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.55c0-.93.26-1.56 1.59-1.56h1.7V3.13c-.29-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.25v2.35H7.4v3.2h2.78V21h3.32Z"
          />
        </svg>
      </button>

      <button
        type="button"
        className="social-circle"
        aria-label="Continuar com X"
        onClick={() => onSelectProvider('X')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
          />
        </svg>
      </button>
    </div>
  )
}
