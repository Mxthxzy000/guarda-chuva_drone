import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type {
  ActionResult,
  AdminStats,
  Atendimento,
  AtendimentoStatus,
  EstacaoRecarga,
  UserProfile,
} from '../types'

// ============================================================================
// Local Demo Mode Storage (usado automaticamente enquanto .env não tiver chaves)
// ============================================================================
const STORAGE_KEYS = {
  users: 'nimbus_demo_users_v1',
  session: 'nimbus_demo_session_v1',
  stations: 'nimbus_demo_stations_v1',
  dispatches: 'nimbus_demo_dispatches_v1',
  resets: 'nimbus_demo_resets_v1',
  pendingResetEmail: 'nimbus_demo_pending_reset_email',
}

interface DemoUserRecord extends UserProfile {
  password_hash: string
}

async function sha256Hash(value: string): Promise<string> {
  const data = new TextEncoder().encode(`nimbus_salt_2026::${value}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return '$sha256$' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function ensureDemoSeeded(): Promise<void> {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const adminHash = await sha256Hash('Admin@123')
    const initialUsers: DemoUserRecord[] = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Administrador Nimbus',
        email: 'admin@nimbus.com',
        bairro: 'Centro Histórico',
        role: 'admin',
        password_hash: adminHash,
        created_at: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(initialUsers))
  }

  if (!localStorage.getItem(STORAGE_KEYS.stations)) {
    const now = new Date().toISOString()
    const initialStations: EstacaoRecarga[] = [
      {
        id: 'st-parque-farroupilha',
        nome: 'Estação Parque Farroupilha',
        endereco: 'Av. José Bonifácio, Farroupilha',
        vagas: 8,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'st-moinhos-vento',
        nome: 'Estação Moinhos de Vento',
        endereco: 'Rua Padre Chagas, Moinhos de Vento',
        vagas: 6,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'st-orla-guaiba',
        nome: 'Estação Orla do Guaíba',
        endereco: 'Av. Edvaldo Pereira Paiva, Praia de Belas',
        vagas: 10,
        created_at: now,
        updated_at: now,
      },
    ]
    localStorage.setItem(STORAGE_KEYS.stations, JSON.stringify(initialStations))
  }

  if (!localStorage.getItem(STORAGE_KEYS.dispatches)) {
    localStorage.setItem(STORAGE_KEYS.dispatches, JSON.stringify([]))
  }
}

function getDemoUsers(): DemoUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]') as DemoUserRecord[]
  } catch {
    return []
  }
}

function saveDemoUsers(users: DemoUserRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
}

function getDemoStations(): EstacaoRecarga[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.stations) || '[]') as EstacaoRecarga[]
  } catch {
    return []
  }
}

function saveDemoStations(stations: EstacaoRecarga[]): void {
  localStorage.setItem(STORAGE_KEYS.stations, JSON.stringify(stations))
}

function getDemoDispatches(): Atendimento[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.dispatches) || '[]') as Atendimento[]
  } catch {
    return []
  }
}

function saveDemoDispatches(dispatches: Atendimento[]): void {
  localStorage.setItem(STORAGE_KEYS.dispatches, JSON.stringify(dispatches))
}

function stripHash(record: DemoUserRecord): UserProfile {
  const { password_hash: _hash, ...profile } = record
  return profile
}

// ============================================================================
// Helpers Supabase
// ============================================================================
async function fetchSupabaseProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, bairro, role, created_at')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as UserProfile
}

// ============================================================================
// API Unificada (Supabase Real + Fallback Local Demo)
// ============================================================================
export const dataService = {
  isLiveSupabase(): boolean {
    return isSupabaseConfigured && supabase !== null
  },

  async getCurrentSessionProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return null
      const profile = await fetchSupabaseProfile(session.user.id)
      if (profile) return profile
      return {
        id: session.user.id,
        nome: (session.user.user_metadata?.nome as string) || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email || '',
        bairro: (session.user.user_metadata?.bairro as string) || 'Centro',
        role: 'user',
        created_at: session.user.created_at,
      }
    }

    await ensureDemoSeeded()
    const savedId = localStorage.getItem(STORAGE_KEYS.session)
    if (!savedId) return null
    const found = getDemoUsers().find((u) => u.id === savedId)
    return found ? stripHash(found) : null
  },

  async register(params: {
    nome: string
    email: string
    bairro: string
    password: string
  }): Promise<ActionResult<UserProfile>> {
    const nome = params.nome.trim()
    const email = params.email.trim().toLowerCase()
    const bairro = params.bairro.trim()

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: params.password,
        options: {
          data: { nome, bairro },
        },
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already exists')) {
          return { ok: false, error: 'Este e-mail já está cadastrado.' }
        }
        return { ok: false, error: 'Não foi possível concluir o cadastro. Verifique os dados informados.' }
      }

      // Supabase retorna identities vazio quando o e-mail já existe (com confirmação ativada)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { ok: false, error: 'Este e-mail já está cadastrado.' }
      }

      if (!data.user) {
        return { ok: false, error: 'Não foi possível criar a conta.' }
      }

      // Aguarda brevemente o trigger criar o perfil e busca o registro
      let profile = await fetchSupabaseProfile(data.user.id)
      if (!profile) {
        profile = {
          id: data.user.id,
          nome,
          email,
          bairro,
          role: 'user',
          created_at: new Date().toISOString(),
        }
      }

      const needsEmailConfirm = !data.session
      return {
        ok: true,
        data: needsEmailConfirm ? undefined : profile,
        message: needsEmailConfirm
          ? 'Cadastro confirmado. Verifique seu e-mail para ativar a conta e faça login.'
          : 'Cadastro realizado com sucesso.',
      }
    }

    // Demo Mode
    await ensureDemoSeeded()
    const users = getDemoUsers()
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'Este e-mail já está cadastrado.' }
    }

    const password_hash = await sha256Hash(params.password)
    const newUser: DemoUserRecord = {
      id: createId(),
      nome,
      email,
      bairro,
      role: 'user',
      password_hash,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)
    saveDemoUsers(users)
    localStorage.setItem(STORAGE_KEYS.session, newUser.id)

    return {
      ok: true,
      data: stripHash(newUser),
      message: 'Cadastro realizado com sucesso.',
    }
  },

  async login(params: { email: string; password: string }): Promise<ActionResult<UserProfile>> {
    const email = params.email.trim().toLowerCase()

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: params.password,
      })

      if (error || !data.user) {
        // CT-02: nunca revelar qual campo está errado
        return { ok: false, error: 'E-mail ou senha inválidos.' }
      }

      const profile = (await fetchSupabaseProfile(data.user.id)) ?? {
        id: data.user.id,
        nome: (data.user.user_metadata?.nome as string) || email.split('@')[0],
        email,
        bairro: (data.user.user_metadata?.bairro as string) || 'Centro',
        role: 'user',
        created_at: data.user.created_at,
      }

      return { ok: true, data: profile }
    }

    // Demo Mode
    await ensureDemoSeeded()
    const users = getDemoUsers()
    const candidate = users.find((u) => u.email.toLowerCase() === email)
    const incomingHash = await sha256Hash(params.password)

    if (!candidate || candidate.password_hash !== incomingHash) {
      // CT-02: mensagem neutra que não revela qual campo está errado
      return { ok: false, error: 'E-mail ou senha inválidos.' }
    }

    localStorage.setItem(STORAGE_KEYS.session, candidate.id)
    return { ok: true, data: stripHash(candidate) }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
      return
    }
    localStorage.removeItem(STORAGE_KEYS.session)
  },

  async requestPasswordReset(emailRaw: string): Promise<ActionResult> {
    const email = emailRaw.trim().toLowerCase()

    if (isSupabaseConfigured && supabase) {
      const { data: exists, error: rpcError } = await supabase.rpc('check_email_exists', {
        p_email: email,
      })

      if (rpcError) {
        return {
          ok: false,
          error: 'Erro ao verificar o e-mail. Confirme se o script supabase/schema.sql foi executado.',
        }
      }

      if (!exists) {
        // CT-03: avisar claramente quando o e-mail não existe
        return { ok: false, error: 'E-mail não encontrado.' }
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (resetError) {
        return {
          ok: false,
          error: 'Não foi possível enviar o e-mail de redefinição agora. Tente novamente em instantes.',
        }
      }

      return {
        ok: true,
        message: `Enviamos as instruções de redefinição para ${email}.`,
      }
    }

    // Demo Mode
    await ensureDemoSeeded()
    const users = getDemoUsers()
    const found = users.find((u) => u.email.toLowerCase() === email)
    if (!found) {
      return { ok: false, error: 'E-mail não encontrado.' }
    }

    const resets = JSON.parse(localStorage.getItem(STORAGE_KEYS.resets) || '[]') as Array<{
      id: string
      email: string
      criado_em: string
    }>
    resets.unshift({ id: createId(), email, criado_em: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEYS.resets, JSON.stringify(resets))
    localStorage.setItem(STORAGE_KEYS.pendingResetEmail, email)

    return {
      ok: true,
      message: `Enviamos as instruções de redefinição para ${email}.`,
    }
  },

  async updatePassword(newPassword: string): Promise<ActionResult> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        return {
          ok: false,
          error: 'Link de redefinição expirado ou inválido. Solicite um novo código por e-mail.',
        }
      }
      return { ok: true, message: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' }
    }

    // Demo Mode
    await ensureDemoSeeded()
    const targetEmail = localStorage.getItem(STORAGE_KEYS.pendingResetEmail)
    const sessionId = localStorage.getItem(STORAGE_KEYS.session)
    const users = getDemoUsers()

    const idx = targetEmail
      ? users.findIndex((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
      : users.findIndex((u) => u.id === sessionId)

    if (idx === -1) {
      return {
        ok: false,
        error: 'Nenhuma solicitação de redefinição ativa. Informe seu e-mail na tela "Esqueceu sua senha?".',
      }
    }

    users[idx].password_hash = await sha256Hash(newPassword)
    saveDemoUsers(users)
    localStorage.removeItem(STORAGE_KEYS.pendingResetEmail)

    return { ok: true, message: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' }
  },

  // --------------------------------------------------------------------------
  // Estações de Recarga (RF04 / CT-04)
  // --------------------------------------------------------------------------
  async listStations(): Promise<EstacaoRecarga[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('estacoes_recarga')
        .select('id, nome, endereco, vagas, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error || !data) return []
      return data as EstacaoRecarga[]
    }

    await ensureDemoSeeded()
    return getDemoStations().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async createStation(input: {
    nome: string
    endereco: string
    vagas: number
  }): Promise<ActionResult<EstacaoRecarga>> {
    const nome = input.nome.trim()
    const endereco = input.endereco.trim()
    const vagas = Number(input.vagas)

    if (!nome || !endereco || !Number.isInteger(vagas) || vagas <= 0) {
      return { ok: false, error: 'Preencha nome, endereço e uma quantidade válida de vagas.' }
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('estacoes_recarga')
        .insert({ nome, endereco, vagas })
        .select('id, nome, endereco, vagas, created_at, updated_at')
        .single()

      if (error || !data) {
        return { ok: false, error: 'Sem permissão ou erro ao cadastrar a estação.' }
      }
      return { ok: true, data: data as EstacaoRecarga, message: 'Estação cadastrada com sucesso.' }
    }

    await ensureDemoSeeded()
    const stations = getDemoStations()
    const now = new Date().toISOString()
    const created: EstacaoRecarga = {
      id: createId(),
      nome,
      endereco,
      vagas,
      created_at: now,
      updated_at: now,
    }
    stations.unshift(created)
    saveDemoStations(stations)
    return { ok: true, data: created, message: 'Estação cadastrada com sucesso.' }
  },

  async updateStation(
    id: string,
    input: { nome: string; endereco: string; vagas: number }
  ): Promise<ActionResult<EstacaoRecarga>> {
    const nome = input.nome.trim()
    const endereco = input.endereco.trim()
    const vagas = Number(input.vagas)

    if (!nome || !endereco || !Number.isInteger(vagas) || vagas <= 0) {
      return { ok: false, error: 'Preencha nome, endereço e uma quantidade válida de vagas.' }
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('estacoes_recarga')
        .update({ nome, endereco, vagas })
        .eq('id', id)
        .select('id, nome, endereco, vagas, created_at, updated_at')
        .single()

      if (error || !data) {
        return { ok: false, error: 'Não foi possível atualizar a estação.' }
      }
      return { ok: true, data: data as EstacaoRecarga, message: 'Estação atualizada com sucesso.' }
    }

    await ensureDemoSeeded()
    const stations = getDemoStations()
    const idx = stations.findIndex((s) => s.id === id)
    if (idx === -1) return { ok: false, error: 'Estação não encontrada.' }

    stations[idx] = {
      ...stations[idx],
      nome,
      endereco,
      vagas,
      updated_at: new Date().toISOString(),
    }
    saveDemoStations(stations)
    return { ok: true, data: stations[idx], message: 'Estação atualizada com sucesso.' }
  },

  async deleteStation(id: string): Promise<ActionResult> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('estacoes_recarga').delete().eq('id', id)
      if (error) return { ok: false, error: 'Não foi possível excluir a estação.' }
      return { ok: true, message: 'Estação excluída com sucesso.' }
    }

    await ensureDemoSeeded()
    const stations = getDemoStations().filter((s) => s.id !== id)
    saveDemoStations(stations)
    return { ok: true, message: 'Estação excluída com sucesso.' }
  },

  // --------------------------------------------------------------------------
  // Atendimentos / Chamar Cobertura (RF05 / CT-05)
  // --------------------------------------------------------------------------
  async listUserDispatches(userId: string): Promise<Atendimento[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('atendimentos')
        .select('id, user_id, estacao_id, local, duracao_minutos, status, criado_em, estacoes_recarga(nome)')
        .eq('user_id', userId)
        .order('criado_em', { ascending: false })

      if (error || !data) return []
      return data.map((row) => {
        const joined = row.estacoes_recarga as { nome?: string } | { nome?: string }[] | null
        const estacaoNome = Array.isArray(joined) ? joined[0]?.nome ?? null : joined?.nome ?? null
        return {
          id: row.id,
          user_id: row.user_id,
          estacao_id: row.estacao_id,
          estacao_nome: estacaoNome,
          local: row.local,
          duracao_minutos: row.duracao_minutos,
          status: row.status as AtendimentoStatus,
          criado_em: row.criado_em,
        }
      })
    }

    await ensureDemoSeeded()
    const stations = getDemoStations()
    return getDemoDispatches()
      .filter((d) => d.user_id === userId)
      .map((d) => ({
        ...d,
        estacao_nome: d.estacao_id ? stations.find((s) => s.id === d.estacao_id)?.nome ?? d.estacao_nome ?? null : null,
      }))
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
  },

  async createDispatch(input: {
    userId: string
    local: string
    duracaoMinutos: number
    estacaoId?: string | null
  }): Promise<ActionResult<Atendimento>> {
    const local = input.local.trim()
    const duracao = Number(input.duracaoMinutos)

    if (!local) {
      return { ok: false, error: 'Informe o local para envio do drone.' }
    }
    if (!Number.isInteger(duracao) || duracao < 5 || duracao > 180) {
      return { ok: false, error: 'Informe uma duração entre 5 e 180 minutos.' }
    }

    // CT-05: não permite abrir um segundo atendimento enquanto houver um em andamento
    const existing = await this.listUserDispatches(input.userId)
    const active = existing.find((d) => d.status === 'A caminho' || d.status === 'Em atendimento')
    if (active) {
      return {
        ok: false,
        error: 'Já existe um atendimento em andamento. Conclua ou cancele o atendimento atual antes de chamar outra cobertura.',
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('atendimentos')
        .insert({
          user_id: input.userId,
          estacao_id: input.estacaoId || null,
          local,
          duracao_minutos: duracao,
          status: 'A caminho',
        })
        .select('id, user_id, estacao_id, local, duracao_minutos, status, criado_em, estacoes_recarga(nome)')
        .single()

      if (error || !data) {
        if (error?.code === '23505') {
          return {
            ok: false,
            error: 'Já existe um atendimento em andamento para sua conta.',
          }
        }
        return { ok: false, error: 'Não foi possível registrar o chamado agora.' }
      }

      const joined = data.estacoes_recarga as { nome?: string } | { nome?: string }[] | null
      const estacaoNome = Array.isArray(joined) ? joined[0]?.nome ?? null : joined?.nome ?? null

      return {
        ok: true,
        data: {
          id: data.id,
          user_id: data.user_id,
          estacao_id: data.estacao_id,
          estacao_nome: estacaoNome,
          local: data.local,
          duracao_minutos: data.duracao_minutos,
          status: data.status as AtendimentoStatus,
          criado_em: data.criado_em,
        },
        message: 'Drone acionado. Status: A caminho.',
      }
    }

    // Demo Mode
    await ensureDemoSeeded()
    const stations = getDemoStations()
    const chosenStation = input.estacaoId ? stations.find((s) => s.id === input.estacaoId) : stations[0]
    const created: Atendimento = {
      id: createId(),
      user_id: input.userId,
      estacao_id: chosenStation?.id ?? null,
      estacao_nome: chosenStation?.nome ?? null,
      local,
      duracao_minutos: duracao,
      status: 'A caminho',
      criado_em: new Date().toISOString(),
    }

    const all = getDemoDispatches()
    all.unshift(created)
    saveDemoDispatches(all)

    return {
      ok: true,
      data: created,
      message: 'Drone acionado. Status: A caminho.',
    }
  },

  async updateDispatchStatus(id: string, status: AtendimentoStatus): Promise<ActionResult<Atendimento>> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('atendimentos')
        .update({ status })
        .eq('id', id)
        .select('id, user_id, estacao_id, local, duracao_minutos, status, criado_em')
        .single()

      if (error || !data) return { ok: false, error: 'Não foi possível atualizar o status do atendimento.' }
      return { ok: true, data: data as Atendimento }
    }

    await ensureDemoSeeded()
    const all = getDemoDispatches()
    const idx = all.findIndex((d) => d.id === id)
    if (idx === -1) return { ok: false, error: 'Atendimento não encontrado.' }
    all[idx] = { ...all[idx], status }
    saveDemoDispatches(all)
    return { ok: true, data: all[idx] }
  },

  // --------------------------------------------------------------------------
  // Estatísticas Administrativas (apenas quando role === 'admin')
  // --------------------------------------------------------------------------
  async getAdminStats(): Promise<AdminStats> {
    if (isSupabaseConfigured && supabase) {
      const [stationsRes, usersRes, dispatchesRes] = await Promise.all([
        supabase.from('estacoes_recarga').select('vagas'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('atendimentos').select('status'),
      ])

      const stations = stationsRes.data ?? []
      const dispatches = dispatchesRes.data ?? []

      return {
        totalEstacoes: stations.length,
        totalVagas: stations.reduce((acc, s) => acc + (Number(s.vagas) || 0), 0),
        totalUsuarios: usersRes.count ?? 0,
        totalAtendimentos: dispatches.length,
        atendimentosAtivos: dispatches.filter(
          (d) => d.status === 'A caminho' || d.status === 'Em atendimento'
        ).length,
      }
    }

    await ensureDemoSeeded()
    const stations = getDemoStations()
    const users = getDemoUsers()
    const dispatches = getDemoDispatches()

    return {
      totalEstacoes: stations.length,
      totalVagas: stations.reduce((acc, s) => acc + s.vagas, 0),
      totalUsuarios: users.length,
      totalAtendimentos: dispatches.length,
      atendimentosAtivos: dispatches.filter(
        (d) => d.status === 'A caminho' || d.status === 'Em atendimento'
      ).length,
    }
  },
}
