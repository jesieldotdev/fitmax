// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────
// Substitua SUPABASE_URL e SUPABASE_ANON_KEY pelas suas credenciais.
// Você pode criar um projeto gratuito em https://supabase.com
//
// No Supabase, habilite Authentication > Email (no painel Settings > Auth)
// Não é necessário criar tabelas extras — o auth do Supabase já cuida do login.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Utilitário leve para chamar a API do Supabase sem o SDK completo
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${options.token || SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  return { data, error: res.ok ? null : data };
}

export const supabase = {
  // Cadastro com e-mail e senha
  async signUp(email, password, nome) {
    return supabaseFetch("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, data: { nome } }),
    });
  },

  // Login com e-mail e senha
  async signIn(email, password) {
    return supabaseFetch("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout
  async signOut(accessToken) {
    return supabaseFetch("/auth/v1/logout", {
      method: "POST",
      token: accessToken,
    });
  },

  // Recuperar sessão do localStorage
  getSession() {
    try {
      const raw = localStorage.getItem("sb_session");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  saveSession(session) {
    if (session) localStorage.setItem("sb_session", JSON.stringify(session));
    else localStorage.removeItem("sb_session");
  },
};
