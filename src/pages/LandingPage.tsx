import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LiveTelemetryMock } from '../components/landing/LiveTelemetryMock'
import '../styles/landing.css'

const STEPS = [
  {
    code: '01',
    title: 'Conecte',
    desc: 'Informe local e duração pelo site.',
  },
  {
    code: '02',
    title: 'Ative',
    desc: 'O drone decola e abre a cobertura.',
  },
  {
    code: '03',
    title: 'Movimente-se',
    desc: 'Caminhe com as mãos livres.',
  },
]

const HARDWARE_SPECS = [
  {
    name: 'Ultrassônico HC-SR04',
    value: '40 a 80 cm',
    desc: 'Mantém altura segura acima do pedestre.',
  },
  {
    name: 'Sensor de chuva',
    value: '0 a 100%',
    desc: 'Lê a precipitação e ajusta o voo.',
  },
  {
    name: 'Acelerômetro MPU6050',
    value: 'Trava > 30°',
    desc: 'Suspende o voo se houver vento forte.',
  },
  {
    name: 'Servo motor e LED',
    value: '180° retrátil',
    desc: 'Abre a cobertura e sinaliza o status.',
  },
]

const STATIONS = [
  { name: 'Parque Farroupilha · Av. José Bonifácio', vagas: '8 vagas' },
  { name: 'Moinhos de Vento · Rua Padre Chagas', vagas: '6 vagas' },
  { name: 'Orla do Guaíba · Av. Edvaldo Pereira Paiva', vagas: '10 vagas' },
]

export function LandingPage() {
  const { user } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('experiencia')
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const heroBgRef = useRef<HTMLImageElement | null>(null)
  const showcaseImgRef = useRef<HTMLImageElement | null>(null)
  const showcaseSecRef = useRef<HTMLElement | null>(null)

  const primaryHref = user ? '/dashboard' : '/cadastro'
  const secondaryHref = user ? '/estacoes' : '/login'
  const secondaryLabel = user ? 'Ver estações' : 'Entrar no sistema'

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 1. Destaque da seção ativa na navbar
    const navTargets = ['experiencia', 'sistema', 'estacoes']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    const navObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { threshold: 0.4 }
    )
    navTargets.forEach((el) => navObserver.observe(el))

    // 2. Animações de revelação ao rolar a página (IntersectionObserver)
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-lp-reveal]'))
    let revealObserver: IntersectionObserver | null = null

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'))
    } else {
      document.documentElement.classList.add('lp-anim-ready')
      revealObserver = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              obs.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.14, rootMargin: '0px 0px -48px 0px' }
      )
      revealEls.forEach((el) => revealObserver?.observe(el))
    }

    // 3. Barra de progresso de scroll + paralaxe suave no hero e na foto principal
    let rafId = 0
    const updateScrollMotion = () => {
      rafId = 0
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const pageProgress = Math.min(1, Math.max(0, scrollY / maxScroll))

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${pageProgress.toFixed(4)})`
      }

      if (reducedMotion) return

      if (heroBgRef.current && scrollY <= window.innerHeight * 1.2) {
        const heroP = Math.min(1, Math.max(0, scrollY / Math.max(1, window.innerHeight)))
        const scale = 1 + heroP * 0.08
        const shiftY = heroP * 28
        heroBgRef.current.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
      }

      if (showcaseSecRef.current && showcaseImgRef.current) {
        const rect = showcaseSecRef.current.getBoundingClientRect()
        const vh = window.innerHeight || 900
        if (rect.bottom > 0 && rect.top < vh) {
          const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
          const scale = 1.07 - p * 0.07
          showcaseImgRef.current.style.transform = `scale(${scale.toFixed(4)})`
        }
      }
    }

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScrollMotion)
      }
    }

    updateScrollMotion()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      navObserver.disconnect()
      revealObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('lp-anim-ready')
      document.body.classList.remove('nav-locked')
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-locked', menuOpen)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`nav nav--split${menuOpen ? ' is-open' : ''}`}>
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">
            Skip to content
          </a>

          <Link className="nav__logo lp-nav-logo" to="/" onClick={closeMenu}>
            <img
              src="/brand/logo-texto-nav.png"
              alt="Nimbus Acessórios Urbanos"
              width={240}
              height={135}
            />
          </Link>

          <nav className="nav__links" aria-label="Principal">
            <div className="nav__item">
              <a
                className="nav__link"
                href="#experiencia"
                aria-current={activeSection === 'experiencia' ? 'page' : undefined}
                onClick={closeMenu}
              >
                Experiência
              </a>
            </div>
            <div className="nav__item">
              <a
                className="nav__link"
                href="#sistema"
                aria-current={activeSection === 'sistema' ? 'page' : undefined}
                onClick={closeMenu}
              >
                Sistema
              </a>
            </div>
            <div className="nav__item">
              <a
                className="nav__link"
                href="#estacoes"
                aria-current={activeSection === 'estacoes' ? 'page' : undefined}
                onClick={closeMenu}
              >
                Estações
              </a>
            </div>
          </nav>

          <div className="nav__actions">
            <Link className="btn btn--primary" to={primaryHref} onClick={closeMenu}>
              Solicitar cobertura
            </Link>
          </div>

          <button
            className="nav__toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
        <div ref={progressBarRef} className="lp-scroll-progress" aria-hidden="true" />
      </header>

      <main id="top">
        {/* Tela 1: Hero visual — somente título chamativo, subtítulo curto (<=3 linhas) e 2 CTAs */}
        <section
          className="hero hero--photo"
          data-enter=""
          data-calm="left"
          data-box="none"
          data-tone="dark"
          aria-labelledby="hero-h"
        >
          <picture className="hero__bg">
            <source media="(max-width: 1023px)" srcSet="/brand/aeropia-hero-mobile.jpg" />
            <img
              ref={heroBgRef}
              src="/brand/aeropia-hero.jpg"
              width={1920}
              height={1072}
              alt="Guarda-chuva drone autônomo Aeropia pairando na chuva urbana em Porto Alegre"
              style={{ ['--ly-pos' as string]: '68% 48%', ['--ly-pos-phone' as string]: '50% 45%' }}
              fetchPriority="high"
            />
          </picture>

          <div className="wrap">
            <div className="hero-text">
              <div className="hero__text">
                <h1 id="hero-h">Guarda-chuva drone autônomo</h1>
                <p className="hero__lead">
                  O Aeropia voa de 40 a 80 cm acima de você em Porto Alegre. Proteção autônoma
                  contra a chuva sem ocupar as mãos.
                </p>
                <div className="btn-row">
                  <Link className="btn btn--primary" to={primaryHref}>
                    Solicitar cobertura
                  </Link>
                  <Link className="btn btn--secondary" to={secondaryHref}>
                    {secondaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tela 2: Visual do produto em uso real + momento dealt liquid-type */}
        <section ref={showcaseSecRef} className="section" id="experiencia" aria-labelledby="exp-h">
          <div className="wrap">
            <div
              className="section-head section-head--split lp-reveal lp-reveal--up"
              data-lp-reveal=""
              data-moment="liquid-type"
              data-moment-opts='{"strength": 0.9}'
            >
              <div>
                <h2 id="exp-h">
                  Aeropia sem mãos. <span className="muted">Trajeto livre.</span>
                </h2>
              </div>
              <p>
                Carregue sacolas ou use o celular na chuva enquanto o drone acompanha você.
              </p>
            </div>

            <div
              className="fill lp-photo-box lp-showcase-frame lp-reveal lp-reveal--scale lp-delay-1"
              data-lp-reveal=""
            >
              <img
                ref={showcaseImgRef}
                src="/brand/aeropia-em-uso.jpg"
                width={1376}
                height={768}
                loading="lazy"
                decoding="async"
                alt="Pedestre caminhando sob chuva com sacolas e celular enquanto o Aeropia paira acima"
              />
            </div>
          </div>
        </section>

        {/* Tela 3: Sistema em 3 passos (texto à esquerda) + UI interativa (visual à direita) */}
        <section className="section ground-surface" id="sistema" aria-labelledby="sys-h">
          <div className="wrap">
            <div className="section-head lp-reveal lp-reveal--up" data-lp-reveal="">
              <h2 id="sys-h">Sistema Aeropia em 3 passos</h2>
              <p>Chame pelo site, acompanhe a chegada e caminhe protegido.</p>
            </div>

            <div className="grid grid--middle">
              <div className="span-5 stack-5">
                <ol className="lp-steps-list">
                  {STEPS.map((step, index) => (
                    <li
                      key={step.code}
                      className={`lp-step-row lp-reveal lp-reveal--left lp-delay-${index + 1}${
                        activeStep === index ? ' is-active' : ''
                      }`}
                      data-lp-reveal=""
                    >
                      <button
                        type="button"
                        className="lp-step-row-btn"
                        aria-pressed={activeStep === index}
                        onClick={() => setActiveStep(index)}
                      >
                        <span className="lp-step-badge">{step.code}</span>
                        <span>
                          <span className="lp-step-title">{step.title}</span>
                          <span className="lp-step-desc">{step.desc}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="lp-reveal lp-reveal--up lp-delay-4" data-lp-reveal="">
                  <Link className="link" to={primaryHref}>
                    Abrir painel de atendimento
                  </Link>
                </div>
              </div>

              <div
                className="span-6 start-7 lp-reveal lp-reveal--right lp-delay-2"
                data-lp-reveal=""
              >
                <LiveTelemetryMock activeStep={activeStep} />
              </div>
            </div>
          </div>
        </section>

        {/* Tela 4: Sensores (texto à esquerda, foto macro à direita) */}
        <section className="section" id="sensores" aria-labelledby="sens-h">
          <div className="wrap">
            <div className="section-head lp-reveal lp-reveal--up" data-lp-reveal="">
              <h2 id="sens-h">Sensores do drone para chuva e vento</h2>
              <p>Leitura em tempo real com suspensão automática acima de 30° de inclinação.</p>
            </div>

            <div className="grid grid--middle">
              <div className="span-5 stack-4">
                <ul className="rows">
                  {HARDWARE_SPECS.map((spec, index) => (
                    <li
                      key={spec.name}
                      className={`lp-reveal lp-reveal--up lp-delay-${Math.min(4, index + 1)}`}
                      data-lp-reveal=""
                    >
                      <span className="rows__name">{spec.name}</span>
                      <span className="rows__value">{spec.value}</span>
                      <p>{spec.desc}</p>
                    </li>
                  ))}
                </ul>
                <div className="lp-reveal lp-reveal--up lp-delay-4" data-lp-reveal="">
                  <Link className="link" to={primaryHref}>
                    Simular no painel Aeropia
                  </Link>
                </div>
              </div>

              <div
                className="span-6 start-7 lp-photo-box lp-split-photo lp-reveal lp-reveal--scale lp-delay-2"
                data-lp-reveal=""
              >
                <img
                  src="/brand/aeropia-sensores.jpg"
                  width={1376}
                  height={768}
                  loading="lazy"
                  decoding="async"
                  alt="Detalhe dos sensores ultrassônicos HC-SR04 e anel LED azul do Aeropia"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tela 5: Estações em Porto Alegre (texto à esquerda, foto à direita) */}
        <section className="section ground-surface" id="estacoes" aria-labelledby="est-h">
          <div className="wrap">
            <div className="section-head lp-reveal lp-reveal--up" data-lp-reveal="">
              <h2 id="est-h">Estações do Aeropia em Porto Alegre</h2>
              <p>Alugue por uso nos pontos de recarga ou adquira sua unidade pessoal.</p>
            </div>

            <div className="grid grid--middle">
              <div className="span-6 lp-station-col">
                <ul className="rows">
                  {STATIONS.map((station, index) => (
                    <li
                      key={station.name}
                      className={`lp-reveal lp-reveal--up lp-delay-${index + 1}`}
                      data-lp-reveal=""
                    >
                      <span className="rows__name">{station.name}</span>
                      <span className="rows__value">{station.vagas}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="lp-offers-grid lp-reveal lp-reveal--up lp-delay-3"
                  data-lp-reveal=""
                >
                  <div className="card lp-offer-card">
                    <h3>Aluguel Aeropia</h3>
                    <span className="lp-offer-price">Por trajeto</span>
                    <p className="lp-offer-desc">Retire e devolva em qualquer estação ativa.</p>
                  </div>
                  <div className="card lp-offer-card">
                    <h3>Unidade Aeropia</h3>
                    <span className="lp-offer-price">R$ 3.240</span>
                    <p className="lp-offer-desc">Lote piloto com 80% de ROI projetado.</p>
                    <Link className="link" to={primaryHref}>
                      Solicitar cobertura
                    </Link>
                  </div>
                </div>
              </div>

              <div
                className="span-6 lp-photo-box lp-split-photo lp-reveal lp-reveal--scale lp-delay-2"
                data-lp-reveal=""
              >
                <img
                  src="/brand/aeropia-estacao.jpg"
                  width={1376}
                  height={768}
                  loading="lazy"
                  decoding="async"
                  alt="Estação urbana de recarga com três drones Aeropia acoplados sob chuva noturna"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tela 6: Encerramento comercial e rodapé */}
      <footer className="footer closing footer--dark" id="contato" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--type lp-reveal lp-reveal--up" data-lp-reveal="">
            <div className="section-head">
              <h2 id="close-h">Mobilidade urbana acima de você com Aeropia</h2>
              <p>Conheça. Experimente. Movimente-se.</p>
            </div>
            <div className="btn-row">
              <Link className="btn btn--primary" to={primaryHref}>
                Solicitar cobertura
              </Link>
              <Link className="btn btn--secondary" to={secondaryHref}>
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="closing__links">
            <div className="grid">
              <div className="span-6 stack-4">
                <span className="lp-footer-wordmark">
                  <span className="mark" data-mark="dots" aria-hidden="true" />
                  Nimbus Acessórios Urbanos
                </span>
                <p className="footer__lede">Guarda-chuva drone autônomo em Porto Alegre, RS.</p>
              </div>

              <div className="span-3 footer__col lp-footer-col">
                <h3>Plataforma</h3>
                <ul>
                  <li>
                    <Link to="/cadastro">Solicitar cobertura</Link>
                  </li>
                  <li>
                    <Link to="/login">Entrar no sistema</Link>
                  </li>
                  <li>
                    <Link to="/dashboard">Chamar Cobertura</Link>
                  </li>
                </ul>
              </div>

              <div className="span-3 footer__col lp-footer-col">
                <h3>Produto</h3>
                <ul>
                  <li>
                    <a href="#experiencia">Experiência</a>
                  </li>
                  <li>
                    <a href="#sistema">Sistema</a>
                  </li>
                  <li>
                    <a href="#sensores">Sensores</a>
                  </li>
                  <li>
                    <a href="#estacoes">Estações</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="footer__legal">
              <span>© 2026 Nimbus Acessórios Urbanos</span>
              <span>Projeto Integrador Fábrica do Futuro · SENAI</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
