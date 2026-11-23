-- ============================================================================
-- NIMBUS AEROPIA (Projeto 08 · Guarda-chuva Drone)
-- Script SQL completo para Supabase (PostgreSQL + Auth + RLS)
-- Execute este arquivo no SQL Editor do painel do Supabase.
-- ============================================================================

-- 1. Tabela de perfis (complementa auth.users do Supabase, onde a senha fica em hash bcrypt)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) > 0),
  email text not null unique,
  bairro text not null check (char_length(trim(bairro)) > 0),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Tabela de estações de recarga (gerenciada apenas pelo Administrador - RF04 / CT-04)
create table if not exists public.estacoes_recarga (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) > 0),
  endereco text not null check (char_length(trim(endereco)) > 0),
  vagas integer not null check (vagas > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Tabela de atendimentos de Chamar Cobertura (RF05 / CT-05)
create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estacao_id uuid references public.estacoes_recarga(id) on delete set null,
  local text not null check (char_length(trim(local)) > 0),
  duracao_minutos integer not null check (duracao_minutos >= 5 and duracao_minutos <= 180),
  status text not null default 'A caminho' check (
    status in ('A caminho', 'Em atendimento', 'Concluído', 'Cancelado')
  ),
  criado_em timestamptz not null default now()
);

-- Garante em nível de banco que um usuário nunca tenha dois atendimentos ativos ao mesmo tempo (CT-05)
create unique index if not exists idx_unico_atendimento_ativo_por_usuario
  on public.atendimentos (user_id)
  where status in ('A caminho', 'Em atendimento');

-- 4. Tabela de registro de solicitações de redefinição de senha (RF03 / CT-03)
create table if not exists public.redefinicoes_senha (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  canal text not null default 'email' check (canal in ('email', 'sms')),
  criado_em timestamptz not null default now()
);

-- 5. Função auxiliar: verifica se o usuário autenticado é administrador (evita recursão em RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 6. Função RPC para CT-03: verifica se o e-mail está cadastrado antes de enviar recuperação
-- Permite avisar "E-mail não encontrado" para e-mails desconhecidos, conforme exigido no CT-03.
create or replace function public.check_email_exists(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1
    from public.profiles
    where lower(email) = lower(trim(p_email))
  ) into v_exists;

  if v_exists then
    insert into public.redefinicoes_senha (email, canal)
    values (lower(trim(p_email)), 'email');
  end if;

  return v_exists;
end;
$$;

grant execute on function public.check_email_exists(text) to anon, authenticated;

-- 7. Trigger automática: cria registro em public.profiles ao cadastrar usuário no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, bairro, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nome'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    coalesce(nullif(trim(new.raw_user_meta_data->>'bairro'), ''), 'Não informado'),
    'user'
  )
  on conflict (id) do update
    set nome = excluded.nome,
        bairro = excluded.bairro;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Trigger automática para updated_at em estacoes_recarga
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_estacoes_updated_at on public.estacoes_recarga;
create trigger trg_estacoes_updated_at
  before update on public.estacoes_recarga
  for each row execute procedure public.touch_updated_at();

-- 9. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.estacoes_recarga enable row level security;
alter table public.atendimentos enable row level security;
alter table public.redefinicoes_senha enable row level security;

-- Policies: profiles
drop policy if exists "Usuário lê próprio perfil ou admin lê todos" on public.profiles;
create policy "Usuário lê próprio perfil ou admin lê todos"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Usuário atualiza próprio perfil (sem alterar role)" on public.profiles;
create policy "Usuário atualiza próprio perfil (sem alterar role)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Policies: estacoes_recarga (todos autenticados leem; apenas admin cria/edita/exclui)
drop policy if exists "Usuários autenticados consultam estações" on public.estacoes_recarga;
create policy "Usuários autenticados consultam estações"
  on public.estacoes_recarga for select
  to authenticated
  using (true);

drop policy if exists "Apenas admin cadastra estações" on public.estacoes_recarga;
create policy "Apenas admin cadastra estações"
  on public.estacoes_recarga for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Apenas admin edita estações" on public.estacoes_recarga;
create policy "Apenas admin edita estações"
  on public.estacoes_recarga for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Apenas admin exclui estações" on public.estacoes_recarga;
create policy "Apenas admin exclui estações"
  on public.estacoes_recarga for delete
  to authenticated
  using (public.is_admin());

-- Policies: atendimentos (usuário vê e gerencia os próprios; admin vê todos)
drop policy if exists "Usuário vê próprios atendimentos ou admin vê todos" on public.atendimentos;
create policy "Usuário vê próprios atendimentos ou admin vê todos"
  on public.atendimentos for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuário cria próprio atendimento" on public.atendimentos;
create policy "Usuário cria próprio atendimento"
  on public.atendimentos for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Usuário atualiza próprio atendimento" on public.atendimentos;
create policy "Usuário atualiza próprio atendimento"
  on public.atendimentos for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Policies: redefinicoes_senha (somente admin consulta)
drop policy if exists "Apenas admin consulta log de redefinições" on public.redefinicoes_senha;
create policy "Apenas admin consulta log de redefinições"
  on public.redefinicoes_senha for select
  to authenticated
  using (public.is_admin());

-- 10. Dados iniciais de estações em Porto Alegre/RS (sem conflitar com 'Estação Mercado Público' do CT-04)
insert into public.estacoes_recarga (nome, endereco, vagas)
select v.nome, v.endereco, v.vagas
from (values
  ('Estação Parque Farroupilha', 'Av. José Bonifácio, Farroupilha', 8),
  ('Estação Moinhos de Vento', 'Rua Padre Chagas, Moinhos de Vento', 6),
  ('Estação Orla do Guaíba', 'Av. Edvaldo Pereira Paiva, Praia de Belas', 10)
) as v(nome, endereco, vagas)
where not exists (select 1 from public.estacoes_recarga limit 1);

-- ============================================================================
-- COMO PROMOVER O USUÁRIO ADMINISTRADOR DE TESTE:
-- 1. Cadastre o usuário admin@nimbus.com pela tela de Cadastro (ou pelo painel Auth do Supabase).
-- 2. Execute o comando abaixo no SQL Editor:
--
--    update public.profiles
--    set role = 'admin'
--    where email = 'admin@nimbus.com';
--
-- DICA PARA TESTES (CT-01 a CT-03):
-- No painel do Supabase, em Authentication -> Providers -> Email, você pode
-- desativar "Confirm email" durante os testes para permitir login imediato após o cadastro.
-- ============================================================================
