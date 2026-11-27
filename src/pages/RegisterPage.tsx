import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail, MapPin, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SocialButtons } from '../components/SocialButtons'
import { ThemeToggle } from '../components/ThemeToggle'

interface RegisterErrors {
  nome?: string
  email?: string
  bairro?: string
  password?: string
  confirmPassword?: string
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [bairro, setBairro] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [infoMsg, setInfoMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMsg(null)
    setInfoMsg(null)

    const nextErrors: RegisterErrors = {}
    if (!nome.trim()) {
      nextErrors.nome = 'Informe seu nome completo.'
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Informe um endereço de e-mail válido.'
    }
    if (!bairro.trim()) {
      nextErrors.bairro = 'Informe seu bairro.'
    }
    if (password.length < 6) {
      nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.'
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas digitadas não conferem.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const result = await register({ nome, email, bairro, password })
      if (!result.ok) {
        setFormError(result.error || 'Não foi possível concluir o cadastro.')
        return
      }

      setSuccessMsg(result.message || 'Cadastro realizado com sucesso.')
      if (result.data) {
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 700)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="btn btn--secondary btn--sm auth-back-btn">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar ao início</span>
        </Link>
        <ThemeToggle showLabel />
      </div>
      <div className="auth-card auth-card--split">
        <section className="auth-column" aria-labelledby="register-heading">
          <div className="auth-logo-mobile">
            <Link to="/" aria-label="Voltar para a página inicial Aeropia">
              <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
            </Link>
          </div>

          <h1 id="register-heading" className="auth-title">
            Cadastre-se
          </h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="reg-nome" className="field__label">
                Nome completo
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <User size={18} />
                </span>
                <input
                  id="reg-nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  className="field__input field__input--with-icon"
                  placeholder="Ex.: Rodrigo Almeida"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(errors.nome)}
                  aria-describedby={errors.nome ? 'reg-nome-err' : undefined}
                />
              </div>
              {errors.nome && (
                <p id="reg-nome-err" className="field__error">
                  {errors.nome}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="reg-email" className="field__label">
                E-mail
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="field__input field__input--with-icon"
                  placeholder="rodrigo.almeida@teste.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'reg-email-err' : undefined}
                />
              </div>
              {errors.email && (
                <p id="reg-email-err" className="field__error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo extra obrigatório do Projeto 08 (RF01 / CT-01) */}
            <div className="field">
              <label htmlFor="reg-bairro" className="field__label">
                Bairro
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <input
                  id="reg-bairro"
                  name="bairro"
                  type="text"
                  autoComplete="address-level3"
                  className="field__input field__input--with-icon"
                  placeholder="Ex.: Centro Histórico"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  aria-invalid={Boolean(errors.bairro)}
                  aria-describedby={errors.bairro ? 'reg-bairro-err' : undefined}
                />
              </div>
              {errors.bairro && (
                <p id="reg-bairro-err" className="field__error">
                  {errors.bairro}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="reg-password" className="field__label">
                Senha
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <KeyRound size={18} />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field__input field__input--with-icon field__input--with-toggle"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'reg-password-err' : undefined}
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
              {errors.password && (
                <p id="reg-password-err" className="field__error">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="reg-confirm" className="field__label">
                Confirmar senha
              </label>
              <div className="field__control">
                <span className="field__icon" aria-hidden="true">
                  <KeyRound size={18} />
                </span>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field__input field__input--with-icon"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'reg-confirm-err' : undefined}
                />
              </div>
              {errors.confirmPassword && (
                <p id="reg-confirm-err" className="field__error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {formError && (
              <div className="alert alert--error" role="alert">
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert alert--success" role="status">
                <span>{successMsg}</span>
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </section>

        {/* Coluna direita igual à print pc-cadastrar.png */}
        <aside className="auth-column" aria-label="Opções de acesso">
          <div className="auth-showcase__media">
            <img
              src="/brand/aeropia-produto.jpg"
              alt="Drone hexacóptero Aeropia com cúpula transparente retrátil"
            />
          </div>

          <p className="auth-subtitle">Ou se cadastrar com:</p>

          <SocialButtons
            onSelectProvider={(provider) =>
              setInfoMsg(
                `Cadastro com ${provider} requer ativação no painel do Supabase. Utilize o formulário ao lado.`
              )
            }
          />

          {infoMsg && (
            <div className="alert alert--info" role="status">
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="auth-footer-links">
            <span>
              Já tem uma conta? <Link to="/login">Faça login</Link>
            </span>
          </div>
        </aside>
      </div>

    </main>
  )
}
