# Nimbus Aeropia — Plataforma Web do Guarda-Chuva Drone

Projeto Integrador **Fábrica do Futuro** · Projeto 08 (Guarda-chuva Drone · Cliente: **Nimbus Acessórios Urbanos**, Porto Alegre/RS).

## Funcionalidades implementadas

- **Cadastro (`/cadastro`)** — Registra nome completo, e-mail, **bairro** e senha em hash (CT-01).
- **Login (`/login`)** — Autenticação com recusa neutra para credenciais inválidas (`E-mail ou senha inválidos.`) e acesso à área interna personalizada (CT-02).
- **Esqueci minha senha (`/esqueceu-senha`) e Redefinir senha (`/redefinir-senha`)** — Verifica se o e-mail existe, avisa quando não encontrado e confirma o envio das instruções para e-mail cadastrado (CT-03).
- **Administrador (`/admin`)** — Área restrita ao administrador para cadastrar, editar e excluir **estações de recarga** (nome, endereço e vagas), refletindo imediatamente em Chamar Cobertura. Usuários comuns têm o acesso bloqueado (CT-04).
- **Chamar Cobertura (`/dashboard` / `/chamar-cobertura`)** — Permite informar local, duração e estação de origem, registra o chamado com status **A caminho**, exibe telemetria dos sensores IoT (HC-SR04, chuva, MPU6050, cúpula) e impede abrir um segundo atendimento simultâneo enquanto houver um ativo (CT-05).

## Integrantes

- DS A (Back-end e banco): *[Preencher nomes]*
- DS B (Front-end e funcionalidade): *[Preencher nomes]*
- Multimídia (Design e produto): *[Preencher nomes]*

## Como rodar o projeto localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

> **Modo demonstração automático:** enquanto o arquivo `.env` não estiver preenchido com as chaves do Supabase, a plataforma funciona em modo demonstração local (`localStorage` + hash SHA-256) para testes imediatos de todas as telas e fluxos.

## Como conectar ao Supabase

1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** no painel do Supabase e execute todo o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. *(Recomendado para testes rápidos)* Em **Authentication → Providers → Email**, desative **Confirm email** para permitir login imediato logo após o cadastro (CT-01 → CT-02).
4. Em **Authentication → URL Configuration**, adicione `http://localhost:5173/redefinir-senha` em **Redirect URLs**.
5. Copie `.env.example` para `.env` e preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
   *(O arquivo `.env` está no `.gitignore` e nunca é enviado ao GitHub.)*
6. Reinicie `npm run dev`.

## Usuário administrador de teste

- **Modo demonstração local:** `admin@nimbus.com` · `Admin@123`
- **No Supabase:** cadastre `admin@nimbus.com` na tela `/cadastro` e execute no SQL Editor:
  ```sql
  update public.profiles
  set role = 'admin'
  where email = 'admin@nimbus.com';
  ```
