import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SocialButtons } from '../components/SocialButtons'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMsg, setInfoMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setInfoMsg(null)

    const errors: { email?: string; password?: string } = {}
    if (!email.trim() || !email.includes('@')) {
      errors.email = 'Informe um endereço de e-mail válido.'
    }
    if (!password) {
      errors.password = 'Informe sua senha para continuar.'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (!result.ok) {
        // CT-02: mensagem neutra que não revela qual campo está errado
        setFormError(result.error || 'E-mail ou senha inválidos.')
        return
      }
      navigate('/dashboard', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocial = (provider: string) => {
    setFormError(null)
    setInfoMsg(
      `O acesso com ${provider} depende da ativação do provedor OAuth no painel do Supabase. Use seu e-mail e senha cadastrados.`
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="btn btn--secondary btn--sm auth-back-btn">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar ao início</span>
        </Link>
      </div>
      <div className="auth-card auth-card--split">
        <section className="auth-column" aria-labelledby="login-heading">
          <div className="auth-logo-mobile auth-logo-mobile--hide-desktop">
            <Link to="/" aria-label="Voltar para a página inicial Aeropia">
              <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
            </Link>
          </div>

          <h1 id="login-heading" className="auth-title">
            Entre para
            <br />
            continuar
          </h1>

          <SocialButtons onSelectProvider={handleSocial} />

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email" className="field__label">
                E-mail
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="field__input field__input--with-icon"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-err' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="login-email-err" className="field__error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="login-password" className="field__label">
                Senha
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <KeyRound size={18} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field__input field__input--with-icon field__input--with-toggle"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'login-password-err' : undefined}
                />
                <button
                  type="button"
                  className="field__toggle"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="login-password-err" className="field__error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="auth-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Lembre-me</span>
              </label>
              <Link to="/esqueceu-senha">Esqueci minha senha</Link>
            </div>

            {formError && (
              <div className="alert alert--error" role="alert">
                <span>{formError}</span>
              </div>
            )}

            {infoMsg && (
              <div className="alert alert--info" role="status">
                <span>{infoMsg}</span>
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer-links">
            <span>
              Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
            </span>
          </div>
        </section>

        {/* Painel visual lateral (desktop) com o produto real Aeropia */}
        <aside className="auth-showcase" aria-label="Visão geral do Aeropia">
          <div className="auth-showcase__brand">
            <Link to="/" aria-label="Voltar para a página inicial Aeropia">
              <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
            </Link>
            <span className="auth-showcase__tag">Aeropia · Porto Alegre</span>
          </div>

          <div className="auth-showcase__media">
            <img
              src="/brand/aeropia-em-uso.jpg"
              alt="Guarda-chuva drone autônomo Aeropia pairando sobre pedestre em dia de chuva"
            />
          </div>

          <div className="auth-showcase__facts">
            <div>
              <span className="auth-fact__value">40–80 cm</span>
              <span className="auth-fact__label">Altura autônoma</span>
            </div>
            <div>
              <span className="auth-fact__value">30° máx.</span>
              <span className="auth-fact__label">Trava de vento</span>
            </div>
            <div>
              <span className="auth-fact__value">24/7</span>
              <span className="auth-fact__label">Estações urbanas</span>
            </div>
          </div>
        </aside>
      </div>


    </main>
  )
}
