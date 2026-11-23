export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  nome: string
  email: string
  bairro: string
  role: UserRole
  created_at: string
}

export interface EstacaoRecarga {
  id: string
  nome: string
  endereco: string
  vagas: number
  created_at: string
  updated_at?: string
}

export type AtendimentoStatus = 'A caminho' | 'Em atendimento' | 'Concluído' | 'Cancelado'

export interface Atendimento {
  id: string
  user_id: string
  estacao_id: string | null
  estacao_nome?: string | null
  local: string
  duracao_minutos: number
  status: AtendimentoStatus
  criado_em: string
}

export interface AdminStats {
  totalEstacoes: number
  totalVagas: number
  totalUsuarios: number
  totalAtendimentos: number
  atendimentosAtivos: number
}

export interface ActionResult<T = void> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}
