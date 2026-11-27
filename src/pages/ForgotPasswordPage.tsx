import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { dataService } from '../services/dataService'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'

export function ForgotPasswordPage() {
  const { isLiveSupabase } = useAuth()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setStatusError(null)
    setStatusSuccess(null)

    if (!email.trim() || !email.includes('@')) {
      setEmailError('Informe um endereço de e-mail válido.')
      return
    }

    setSendingEmail(true)
    try {
      const result = await dataService.requestPasswordReset(email)
      if (!result.ok) {
        // CT-03: avisa claramente que o e-mail não foi encontrado
        setStatusError(result.error || 'E-mail não encontrado.')
        return
      }
      setStatusSuccess(
        result.message || `Enviamos as instruções de redefinição para ${email.trim()}.`
      )
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSmsSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPhoneError(null)
    setStatusError(null)
    setStatusSuccess(null)

    if (phone.replace(/\D/g, '').length < 10) {
      setPhoneError('Informe um número de telefone com DDD.')
      return
    }

    setStatusError(
      'O envio por SMS requer integração Twilio configurada no Supabase. Utilize a recuperação por e-mail acima.'
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar auth-topbar--end">
        <ThemeToggle showLabel />
      </div>
      <div className="auth-card auth-card--split">
        <section className="auth-column" aria-labelledby="forgot-heading">
          <div className="auth-logo-mobile">
            <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
          </div>

          <h1 id="forgot-heading" className="auth-title">
            Esqueceu
            <br />
            sua senha?
          </h1>

          <p className="auth-subtitle">
            Escolha uma das opções abaixo para redefinir sua senha:
          </p>

          <div className="auth-footer-links">
            <Link to="/login" className="btn btn--ghost">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </section>

        <section className="auth-column" aria-label="Métodos de recuperação">
          {/* Opção 1: Recuperação via E-mail (RF03 / CT-03) */}
          <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
            <div className="field">
              <label htmlFor="forgot-email" className="field__label">
                E-mail cadastrado
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="field__input field__input--with-icon"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'forgot-email-err' : undefined}
                />
              </div>
              {emailError && (
                <p id="forgot-email-err" className="field__error">
                  {emailError}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn--primary btn--full" disabled={sendingEmail}>
              {sendingEmail ? 'Enviando...' : 'Enviar código via E-mail'}
            </button>
          </form>

          {statusError && (
            <div className="alert alert--error" role="alert">
              <span>{statusError}</span>
            </div>
          )}

          {statusSuccess && (
            <div className="alert alert--success" role="status">
              <div>
                <strong>{statusSuccess}</strong>
                {!isLiveSupabase && (
                  <div style={{ marginTop: 8 }}>
                    <Link to="/redefinir-senha">Abrir tela de nova senha</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opção 2: Recuperação via SMS (presente no protótipo Figma) */}
          <form className="auth-form" onSubmit={handleSmsSubmit} noValidate style={{ marginTop: 8 }}>
            <div className="field">
              <label htmlFor="forgot-phone" className="field__label">
                Número de Telefone
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <Phone size={18} />
                </span>
                <input
                  id="forgot-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="field__input field__input--with-icon"
                  placeholder="Número de Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? 'forgot-phone-err' : undefined}
                />
              </div>
              {phoneError && (
                <p id="forgot-phone-err" className="field__error">
                  {phoneError}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn--primary btn--full">
              Enviar código via SMS
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
