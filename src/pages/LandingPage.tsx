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
  const heroTextRef = useRef<HTMLDivElement | null>(null)

  const primaryHref = user ? '/dashboard' : '/cadastro'
  const secondaryHref = user ? '/estacoes' : '/login'
  const secondaryLabel = user ? 'Ver estações' : 'Entrar no sistema'

  useEffect(() => {
    // 1. Destaque da seção ativa na navbar e brilho sutil de seção ativa
    const sectionEls = Array.from(
      document.querySelectorAll<HTMLElement>('main#top > section[id], footer#contato')
    )

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('lp-sec-active', entry.isIntersecting)
          if (entry.isIntersecting && ['experiencia', 'sistema', 'estacoes'].includes(entry.target.id)) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { threshold: 0.35 }
    )
    sectionEls.forEach((el) => sectionObserver.observe(el))

    // 2. Revelação fluida ao rolar para baixo (funciona mesmo quando o Windows desativa efeitos visuais)
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-lp-reveal]'))
    document.documentElement.classList.add('lp-anim-ready')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.95) {
            entry.target.classList.remove('is-visible')
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    )
    revealEls.forEach((el) => revealObserver.observe(el))

    // 3. Progresso de leitura + paralaxe contínua no Hero e em todas as fotos de seção
    const parallaxImgs = Array.from(document.querySelectorAll<HTMLImageElement>('[data-lp-parallax]'))
    let rafId = 0

    const updateScrollMotion = () => {
      rafId = 0
      const scrollY = window.scrollY
      const vh = Math.max(1, window.innerHeight)
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
      const pageProgress = Math.min(1, Math.max(0, scrollY / maxScroll))

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${pageProgress.toFixed(4)})`
      }

      // Profundidade cinematográfica no Hero ao rolar para baixo
      if (scrollY <= vh * 1.25) {
        const heroP = Math.min(1, Math.max(0, scrollY / vh))
        if (heroBgRef.current) {
          const scale = 1 + heroP * 0.11
          const shiftY = heroP * 42
          heroBgRef.current.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
        }
        if (heroTextRef.current) {
          const liftY = -heroP * 36
          const opacity = Math.max(0.15, 1 - heroP * 0.85)
          heroTextRef.current.style.transform = `translate3d(0, ${liftY.toFixed(1)}px, 0)`
          heroTextRef.current.style.opacity = opacity.toFixed(3)
        }
      }

      // Movimento contínuo de escala e deslocamento nas fotos de cada seção
      for (const img of parallaxImgs) {
        const box = img.parentElement
        if (!box) continue
        const rect = box.getBoundingClientRect()
        if (rect.bottom < -40 || rect.top > vh + 40) continue
        const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
        const offset = (p - 0.5) * -28
        const scale = 1.09 - p * 0.05
        img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
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
      sectionObserver.disconnect()
      revealObserver.disconnect()
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
              <div ref={heroTextRef} className="hero__text lp-hero-motion">
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
        <section className="section lp-scroll-sec" id="experiencia" aria-labelledby="exp-h">
          <div className="wrap">
            <div
              className="section-head section-head--split"
              data-moment="liquid-type"
              data-moment-opts='{"strength": 0.9}'
            >
              <div>
                <h2 id="exp-h" className="lp-reveal lp-reveal--title" data-lp-reveal="">
                  Aeropia sem mãos. <span className="muted">Trajeto livre.</span>
                </h2>
              </div>
              <p className="lp-reveal lp-reveal--up lp-delay-2" data-lp-reveal="">
                Carregue sacolas ou use o celular na chuva enquanto o drone acompanha você.
              </p>
            </div>

            <div
              className="fill lp-photo-box lp-showcase-frame lp-reveal lp-reveal--curtain lp-delay-2"
              data-lp-reveal=""
            >
              <img
                data-lp-parallax=""
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
        <section className="section ground-surface lp-scroll-sec" id="sistema" aria-labelledby="sys-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="sys-h" className="lp-reveal lp-reveal--title" data-lp-reveal="">
                Sistema Aeropia em 3 passos
              </h2>
              <p className="lp-reveal lp-reveal--up lp-delay-1" data-lp-reveal="">
                Chame pelo site, acompanhe a chegada e caminhe protegido.
              </p>
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
        <section className="section lp-scroll-sec" id="sensores" aria-labelledby="sens-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="sens-h" className="lp-reveal lp-reveal--title" data-lp-reveal="">
                Sensores do drone para chuva e vento
              </h2>
              <p className="lp-reveal lp-reveal--up lp-delay-1" data-lp-reveal="">
                Leitura em tempo real com suspensão automática acima de 30° de inclinação.
              </p>
            </div>

            <div className="grid grid--middle">
              <div className="span-5 stack-4">
                <ul className="rows">
                  {HARDWARE_SPECS.map((spec, index) => (
                    <li
                      key={spec.name}
                      className={`lp-reveal lp-reveal--left lp-delay-${Math.min(4, index + 1)}`}
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
                className="span-6 start-7 lp-photo-box lp-split-photo lp-reveal lp-reveal--curtain lp-delay-2"
                data-lp-reveal=""
              >
                <img
                  data-lp-parallax=""
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
        <section className="section ground-surface lp-scroll-sec" id="estacoes" aria-labelledby="est-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="est-h" className="lp-reveal lp-reveal--title" data-lp-reveal="">
                Estações do Aeropia em Porto Alegre
              </h2>
              <p className="lp-reveal lp-reveal--up lp-delay-1" data-lp-reveal="">
                Alugue por uso nos pontos de recarga ou adquira sua unidade pessoal.
              </p>
            </div>

            <div className="grid grid--middle">
              <div className="span-6 lp-station-col">
                <ul className="rows">
                  {STATIONS.map((station, index) => (
                    <li
                      key={station.name}
                      className={`lp-reveal lp-reveal--left lp-delay-${index + 1}`}
                      data-lp-reveal=""
                    >
                      <span className="rows__name">{station.name}</span>
                      <span className="rows__value">{station.vagas}</span>
                    </li>
                  ))}
                </ul>

                <div className="lp-offers-grid">
                  <div
                    className="card lp-offer-card lp-reveal lp-reveal--up lp-delay-3"
                    data-lp-reveal=""
                  >
                    <h3>Aluguel Aeropia</h3>
                    <span className="lp-offer-price">Por trajeto</span>
                    <p className="lp-offer-desc">Retire e devolva em qualquer estação ativa.</p>
                  </div>
                  <div
                    className="card lp-offer-card lp-reveal lp-reveal--up lp-delay-4"
                    data-lp-reveal=""
                  >
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
                className="span-6 lp-photo-box lp-split-photo lp-reveal lp-reveal--curtain lp-delay-2"
                data-lp-reveal=""
              >
                <img
                  data-lp-parallax=""
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
      <footer className="footer closing footer--dark lp-scroll-sec" id="contato" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--type">
            <div className="section-head">
              <h2 id="close-h" className="lp-reveal lp-reveal--title" data-lp-reveal="">
                Mobilidade urbana acima de você com Aeropia
              </h2>
              <p className="lp-reveal lp-reveal--up lp-delay-1" data-lp-reveal="">
                Conheça. Experimente. Movimente-se.
              </p>
            </div>
            <div className="btn-row lp-reveal lp-reveal--up lp-delay-2" data-lp-reveal="">
              <Link className="btn btn--primary" to={primaryHref}>
                Solicitar cobertura
              </Link>
              <Link className="btn btn--secondary" to={secondaryHref}>
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="closing__links lp-reveal lp-reveal--up lp-delay-2" data-lp-reveal="">
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
