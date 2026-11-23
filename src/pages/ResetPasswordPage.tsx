import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import { dataService } from '../services/dataService'

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMsg(null)

    const nextErrors: { password?: string; confirm?: string } = {}
    if (password.length < 6) {
      nextErrors.password = 'A nova senha deve ter pelo menos 6 caracteres.'
    }
    if (confirmPassword !== password) {
      nextErrors.confirm = 'As senhas não conferem.'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const result = await dataService.updatePassword(password)
      if (!result.ok) {
        setFormError(result.error || 'Não foi possível redefinir a senha.')
        return
      }
      setSuccessMsg(result.message || 'Senha redefinida com sucesso.')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1400)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--centered">
        <div
          style={{
            width: '100%',
            maxWidth: 620,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div className="auth-logo-mobile">
            <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
          </div>

          <h1 className="auth-title">Redefinir senha</h1>

          <form
            className="auth-form"
            style={{ alignItems: 'center', gap: 20 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="reset-inputs-row">
              <div className="field">
                <label htmlFor="reset-password" className="field__label">
                  Nova senha
                </label>
                <div className="field__control">
                  <span className="field__icon" aria-hidden="true">
                    <KeyRound size={18} />
                  </span>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="field__input field__input--with-icon field__input--with-toggle"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'reset-pass-err' : undefined}
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
                  <p id="reset-pass-err" className="field__error">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="reset-confirm" className="field__label">
                  Confirmar nova senha
                </label>
                <div className="field__control">
                  <span className="field__icon" aria-hidden="true">
                    <KeyRound size={18} />
                  </span>
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="field__input field__input--with-icon"
                    placeholder="Confirmar nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirm)}
                    aria-describedby={fieldErrors.confirm ? 'reset-confirm-err' : undefined}
                  />
                </div>
                {fieldErrors.confirm && (
                  <p id="reset-confirm-err" className="field__error">
                    {fieldErrors.confirm}
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div className="alert alert--error" role="alert" style={{ width: '100%' }}>
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert alert--success" role="status" style={{ width: '100%' }}>
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              style={{ minWidth: 200 }}
              disabled={submitting}
            >
              {submitting ? 'Redefinindo...' : 'Redefinir'}
            </button>
          </form>

          <Link to="/login" className="btn btn--ghost">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Voltar para o login</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
