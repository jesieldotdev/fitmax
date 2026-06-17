import { useState, useEffect } from "react";
import Icon from "./icons.jsx";
import { supabase } from "./supabase.js";

// ─── SPIN KEYFRAME via style tag ──────────────────────────────────────────
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ─── TEMA ─────────────────────────────────────────────────────────────────
const TEMA = {
  M: {
    bg: "#1A1C20", card: "#22252C", card2: "#2A2E38", border: "#32373F",
    accent: "#3DDC84", accent2: "#C9A84C", text: "#E8EAF0", muted: "#8892A0",
    dim: "#4A5260",
    grad: "linear-gradient(160deg, #1A1C20 0%, #1E2530 100%)",
    headerGrad: "linear-gradient(180deg, #1E2530 0%, #1A1C20 100%)",
    tag: "#3DDC8420", tagBorder: "#3DDC8440",
  },
  F: {
    bg: "#1E1A24", card: "#26202E", card2: "#2E2738", border: "#3A3048",
    accent: "#C084FC", accent2: "#F472B6", text: "#EDE8F5", muted: "#9088A8",
    dim: "#5A4E70",
    grad: "linear-gradient(160deg, #1E1A24 0%, #221830 100%)",
    headerGrad: "linear-gradient(180deg, #221830 0%, #1E1A24 100%)",
    tag: "#C084FC20", tagBorder: "#C084FC40",
  },
};

// ─── DADOS DE TREINO ──────────────────────────────────────────────────────
const PLANOS = {
  M: {
    label: "Masculino",
    divisao: [
      { dia: "SEG", treino: "A", foco: "Peito + Tríceps" },
      { dia: "TER", treino: "B", foco: "Costas + Bíceps" },
      { dia: "QUA", treino: "—", foco: "Descanso / Cardio" },
      { dia: "QUI", treino: "C", foco: "Pernas + Glúteos" },
      { dia: "SEX", treino: "D", foco: "Ombros + Posterior" },
      { dia: "SAB", treino: "HIT", foco: "Cardio HIT 30 min" },
      { dia: "DOM", treino: "—", foco: "Descanso Total" },
    ],
    treinos: {
      A: { nome: "PEITO + TRÍCEPS", desc: "Foco em supino e variações. Tríceps ao final.", exercicios: [
        { nome: "Supino Reto com Barra", series: 4, reps: "6–10", descanso: "120s", dica: "Desça até o peito, cotovelos 45°" },
        { nome: "Supino Inclinado Halter", series: 3, reps: "10–12", descanso: "90s", dica: "Inclinação 30–45°" },
        { nome: "Crucifixo na Polia", series: 3, reps: "12–15", descanso: "60s", dica: "Arco amplo, sinta o alongamento" },
        { nome: "Flexão com Peso", series: 3, reps: "10–15", descanso: "60s", dica: "Alternativa ao mergulho" },
        { nome: "Tríceps Pulley Corda", series: 4, reps: "12–15", descanso: "60s", dica: "Abra as pontas no final" },
        { nome: "Tríceps Testa (Skullcrusher)", series: 3, reps: "10–12", descanso: "75s", dica: "Barra W ou halteres" },
      ]},
      B: { nome: "COSTAS + BÍCEPS", desc: "Puxamentos verticais e horizontais. Bíceps no final.", exercicios: [
        { nome: "Barra Fixa / Puxada Frontal", series: 4, reps: "6–10", descanso: "120s", dica: "Puxe o cotovelo para baixo" },
        { nome: "Remada Curvada com Barra", series: 4, reps: "8–10", descanso: "90s", dica: "Tronco 45°, puxe para o umbigo" },
        { nome: "Remada Unilateral Halter", series: 3, reps: "10–12 cada", descanso: "75s", dica: "Apoie joelho no banco" },
        { nome: "Pullover com Halter", series: 3, reps: "12–15", descanso: "60s", dica: "Cotovelo ligeiramente dobrado" },
        { nome: "Rosca Direta com Barra", series: 4, reps: "8–12", descanso: "75s", dica: "Sem balanço do tronco" },
        { nome: "Rosca Martelo (Hammer Curl)", series: 3, reps: "10–14", descanso: "60s", dica: "Trabalha braquial e braquiorradial" },
      ]},
      C: { nome: "PERNAS + GLÚTEOS", desc: "Quadríceps, posterior e glúteos. Maior volume.", exercicios: [
        { nome: "Agachamento Livre com Barra", series: 4, reps: "6–10", descanso: "150s", dica: "Desça abaixo do paralelo se possível" },
        { nome: "Leg Press 45°", series: 4, reps: "10–15", descanso: "90s", dica: "Pés na largura dos ombros" },
        { nome: "Cadeira Extensora", series: 3, reps: "12–15", descanso: "60s", dica: "Segure 1s no topo" },
        { nome: "Stiff com Barra (RDL)", series: 4, reps: "10–12", descanso: "90s", dica: "Sinta o alongamento dos isquiotibiais" },
        { nome: "Flexora Deitada", series: 3, reps: "12–15", descanso: "60s", dica: "Movimento controlado" },
        { nome: "Panturrilha em Pé", series: 4, reps: "15–20", descanso: "45s", dica: "Segure 2s no topo, 2s embaixo" },
      ]},
      D: { nome: "OMBROS + POSTERIOR", desc: "Deltoides em todas as cabeças. Hip Thrust e posterior.", exercicios: [
        { nome: "Desenvolvimento Militar", series: 4, reps: "6–10", descanso: "120s", dica: "Em pé ou sentado, coluna reta" },
        { nome: "Elevação Lateral com Halter", series: 4, reps: "12–15", descanso: "60s", dica: "Cotovelo levemente dobrado" },
        { nome: "Remada Alta (Upright Row)", series: 3, reps: "12–14", descanso: "60s", dica: "Puxe cotovelos para cima e fora" },
        { nome: "Elevação Frontal Alternada", series: 3, reps: "12 cada", descanso: "60s", dica: "Controle a descida" },
        { nome: "Hip Thrust com Barra", series: 4, reps: "10–12", descanso: "90s", dica: "Squeeze glúteo no topo por 1s" },
        { nome: "Face Pull na Polia", series: 3, reps: "15", descanso: "60s", dica: "Trabalha deltóide posterior e manguito" },
      ]},
    },
  },
  F: {
    label: "Feminino",
    divisao: [
      { dia: "SEG", treino: "A", foco: "Glúteos + Quadríceps" },
      { dia: "TER", treino: "B", foco: "Costas + Bíceps" },
      { dia: "QUA", treino: "—", foco: "Descanso / Cardio leve" },
      { dia: "QUI", treino: "C", foco: "Posterior + Core" },
      { dia: "SEX", treino: "D", foco: "Ombros + Tríceps" },
      { dia: "SAB", treino: "HIT", foco: "Cardio HIT / Glúteos extra" },
      { dia: "DOM", treino: "—", foco: "Descanso Total" },
    ],
    treinos: {
      A: { nome: "GLÚTEOS + QUADRÍCEPS", desc: "Foco máximo em glúteos e coxas. Maior volume nessa sessão.", exercicios: [
        { nome: "Hip Thrust com Barra", series: 4, reps: "10–15", descanso: "90s", dica: "Squeeze no topo por 2s, pé plano" },
        { nome: "Agachamento Livre / Goblet", series: 4, reps: "10–15", descanso: "90s", dica: "Joelhos para fora, desça fundo" },
        { nome: "Leg Press 45° (pés altos)", series: 3, reps: "12–15", descanso: "75s", dica: "Pés altos e afastados ativa mais glúteo" },
        { nome: "Cadeira Abdutora", series: 4, reps: "15–20", descanso: "60s", dica: "Inclinar tronco levemente para frente" },
        { nome: "Afundo Reverso com Halteres", series: 3, reps: "12 cada", descanso: "75s", dica: "Passo para trás, joelho quase no chão" },
        { nome: "Elevação Pélvica 1 perna", series: 3, reps: "15 cada", descanso: "60s", dica: "Quadril alto, squeeze glúteo" },
      ]},
      B: { nome: "COSTAS + BÍCEPS", desc: "Defina as costas para criar o V que valoriza a cintura.", exercicios: [
        { nome: "Puxada Frontal (pegada aberta)", series: 4, reps: "10–14", descanso: "75s", dica: "Puxe o cotovelo para baixo e trás" },
        { nome: "Remada Sentada na Polia", series: 4, reps: "12–14", descanso: "75s", dica: "Peito fora, escápulas juntas no final" },
        { nome: "Remada Curvada com Halter", series: 3, reps: "12 cada", descanso: "60s", dica: "Puxe cotovelo para o teto" },
        { nome: "Pullover na Polia", series: 3, reps: "15", descanso: "60s", dica: "Braços estendidos, foco no grande dorsal" },
        { nome: "Rosca Direta com Halteres", series: 3, reps: "12–14", descanso: "60s", dica: "Gire o pulso ao subir (supinação)" },
        { nome: "Rosca Concentrada", series: 3, reps: "12–15 cada", descanso: "45s", dica: "Cotovelo fixo na coxa, foco no pico" },
      ]},
      C: { nome: "POSTERIOR + CORE", desc: "Isquiotibiais, glúteo médio e core forte para performance.", exercicios: [
        { nome: "Stiff com Halteres (RDL)", series: 4, reps: "12–14", descanso: "90s", dica: "Sinta o stretch nos isquiotibiais" },
        { nome: "Flexora Deitada", series: 4, reps: "12–15", descanso: "60s", dica: "Quadril no banco, movimento controlado" },
        { nome: "Abdutora em pé (polia)", series: 3, reps: "15 cada", descanso: "60s", dica: "Controla a volta, glúteo médio" },
        { nome: "Agachamento Sumô com Halter", series: 3, reps: "15", descanso: "75s", dica: "Pés bem abertos, ponta dos pés para fora" },
        { nome: "Prancha Frontal", series: 3, reps: "45s", descanso: "45s", dica: "Quadril neutro, glúteo contraído" },
        { nome: "Russian Twist com Anilha", series: 3, reps: "20 total", descanso: "45s", dica: "Oblíquos e rotação de tronco" },
      ]},
      D: { nome: "OMBROS + TRÍCEPS", desc: "Ombros definidos que criam proporção. Tríceps ao final.", exercicios: [
        { nome: "Desenvolvimento Arnold", series: 4, reps: "10–14", descanso: "75s", dica: "Rotação completa — trabalha todas as cabeças" },
        { nome: "Elevação Lateral c/ Halter", series: 4, reps: "14–16", descanso: "60s", dica: "Cotovelo levemente dobrado, sem balançar" },
        { nome: "Elevação Frontal com Anilha", series: 3, reps: "14", descanso: "60s", dica: "Controla a descida (excêntrico)" },
        { nome: "Face Pull na Polia", series: 3, reps: "15–18", descanso: "60s", dica: "Postura e saúde do ombro" },
        { nome: "Tríceps Pulley (corda)", series: 3, reps: "14–16", descanso: "60s", dica: "Abra as pontas no final do movimento" },
        { nome: "Tríceps Coice com Halter", series: 3, reps: "12–14 cada", descanso: "45s", dica: "Cotovelo fixo, foco na contração" },
      ]},
    },
  },
};

function calcPerfil({ sexo, peso, altura, objetivo }) {
  const idade = 28;
  const tmb = sexo === "F"
    ? 10 * peso + 6.25 * altura - 5 * idade - 161
    : 10 * peso + 6.25 * altura - 5 * idade + 5;
  const tdee = Math.round(tmb * 1.55);
  const kcal = objetivo === "hipertrofia" ? tdee + 300 : objetivo === "emagrecimento" ? tdee - 400 : tdee;
  const ptn = Math.round(peso * (sexo === "F" ? 1.9 : 2.1));
  const gord = Math.round(peso * 0.85);
  const cho = Math.max(50, Math.round((kcal - ptn * 4 - gord * 9) / 4));
  const agua = (peso * 35 / 1000).toFixed(1);
  return { kcal, ptn, cho, gord, agua, tdee };
}

const SEMANAS = Array.from({ length: 12 }, (_, i) => i + 1);

// ─── COMPONENTES UTILITÁRIOS ──────────────────────────────────────────────
function Pill({ children, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      color, background: bg, border: `1px solid ${color}40`,
    }}>{children}</span>
  );
}

function StatCard({ value, label, color, t, icon: Ic }) {
  return (
    <div style={{
      flex: 1, background: t.card, borderRadius: 16,
      padding: "16px 10px 14px", textAlign: "center",
      border: `1px solid ${t.border}`, display: "flex",
      flexDirection: "column", alignItems: "center", gap: 6,
    }}>
      {Ic && <Ic width={16} height={16} style={{ color: color, opacity: 0.7 }} />}
      <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: t.muted, letterSpacing: 0.8, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, icon: Ic, rightSlot, t, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 10, color: t?.muted || "#8892A0", marginBottom: 7, letterSpacing: 1.3, fontWeight: 700 }}>{label}</div>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Ic && (
          <div style={{ position: "absolute", left: 14, color: focused ? (t?.accent || "#3DDC84") : "#4A5260", transition: "color 0.2s", pointerEvents: "none" }}>
            <Ic width={16} height={16} />
          </div>
        )}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%", padding: `14px ${rightSlot ? "48px" : "16px"} 14px ${Ic ? "44px" : "16px"}`,
            borderRadius: 12, outline: "none",
            background: "#22252C",
            border: `1.5px solid ${focused ? (t?.accent || "#3DDC84") + "80" : "#32373F"}`,
            color: "#E8EAF0", fontSize: 15, transition: "border-color 0.2s",
          }}
        />
        {rightSlot && <div style={{ position: "absolute", right: 0 }}>{rightSlot}</div>}
      </div>
    </div>
  );
}

// ─── TELA DE AUTH (Supabase) ──────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const T = { accent: "#3DDC84", muted: "#8892A0", card: "#22252C", border: "#32373F" };

  async function handleLogin() {
    setErro(""); setLoading(true);
    const { data, error } = await supabase.signIn(email.trim(), senha);
    setLoading(false);
    if (error) { setErro(error.error_description || error.msg || "E-mail ou senha incorretos."); return; }
    supabase.saveSession(data);
    const nomeUsuario = data.user?.user_metadata?.nome || email.split("@")[0];
    onLogin({ email: data.user.email, nome: nomeUsuario, token: data.access_token });
  }

  async function handleCadastro() {
    setErro("");
    if (!nome.trim()) { setErro("Informe seu nome."); return; }
    if (!email.includes("@")) { setErro("E-mail inválido."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    setLoading(true);
    const { data, error } = await supabase.signUp(email.trim(), senha, nome.trim());
    setLoading(false);
    if (error) { setErro(error.msg || "Erro ao criar conta. Tente novamente."); return; }
    // Supabase pode exigir confirmação de e-mail; se não, faz login direto
    if (data?.access_token) {
      supabase.saveSession(data);
      onLogin({ email: data.user.email, nome: nome.trim(), token: data.access_token });
    } else {
      setErro(""); setModo("confirmacao");
    }
  }

  if (modo === "confirmacao") {
    return (
      <div style={{
        minHeight: "100dvh", width: "100%", maxWidth: 440, margin: "0 auto",
        background: "#1A1C20", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "0 24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#E8EAF0", marginBottom: 10 }}>Confirme seu e-mail</div>
          <div style={{ fontSize: 14, color: "#8892A0", lineHeight: 1.6, marginBottom: 28 }}>
            Enviamos um link para <strong style={{ color: "#E8EAF0" }}>{email}</strong>. Clique nele para ativar sua conta e volte para fazer login.
          </div>
          <button onClick={() => setModo("login")} style={{
            padding: "14px 28px", borderRadius: 12, border: "none",
            background: "#3DDC84", color: "#0D1A10", fontWeight: 800, fontSize: 15, cursor: "pointer",
          }}>Ir para o login</button>
        </div>
      </div>
    );
  }

  const eyeBtn = (
    <button onClick={() => setMostrarSenha(v => !v)} style={{
      padding: "0 14px", height: "100%", background: "none", border: "none",
      color: "#4A5260", cursor: "pointer", display: "flex", alignItems: "center",
    }}>
      {mostrarSenha ? <Icon.EyeOff width={17} height={17} /> : <Icon.Eye width={17} height={17} />}
    </button>
  );

  return (
    <div style={{
      minHeight: "100dvh", width: "100%", maxWidth: 440, margin: "0 auto",
      background: "#1A1C20", display: "flex", flexDirection: "column",
    }}>
      {/* Hero */}
      <div style={{
        padding: "56px 28px 36px", textAlign: "center",
        background: "linear-gradient(180deg, #1E2530 0%, #1A1C20 100%)",
        borderBottom: "1px solid #22252C",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(135deg, #3DDC8428, #3DDC840E)",
          border: "1px solid #3DDC8440",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon.Dumbbell width={34} height={34} style={{ color: "#3DDC84" }} />
        </div>
        <div style={{ fontSize: 8, letterSpacing: 4, color: "#3DDC84", fontWeight: 700, marginBottom: 8 }}>
          FICHAS DE TREINO
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#E8EAF0", letterSpacing: -1 }}>MAX</div>
        <div style={{ fontSize: 13, color: "#8892A0", marginTop: 8 }}>Seu plano de treino personalizado</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "24px 24px 0", background: "#22252C", borderRadius: 14, padding: 4 }}>
        {[["login", "Entrar"], ["cadastro", "Criar conta"]].map(([id, label]) => (
          <button key={id} onClick={() => { setModo(id); setErro(""); }} style={{
            flex: 1, padding: "11px 0", border: "none", borderRadius: 10, cursor: "pointer",
            background: modo === id ? "#2A2E38" : "transparent",
            color: modo === id ? "#E8EAF0" : "#8892A0",
            fontWeight: 700, fontSize: 14, transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ padding: "24px 24px 0", flex: 1 }}>
        {modo === "cadastro" && (
          <InputField label="NOME COMPLETO" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Seu nome" icon={Icon.User} t={T} />
        )}
        <InputField label="E-MAIL" type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" icon={Icon.Mail} t={T}
          onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()} />
        <InputField label="SENHA" type={mostrarSenha ? "text" : "password"} value={senha}
          onChange={e => setSenha(e.target.value)} placeholder="••••••"
          icon={Icon.Lock} rightSlot={eyeBtn} t={T}
          onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()} />
        {modo === "cadastro" && (
          <InputField label="CONFIRMAR SENHA" type={mostrarSenha ? "text" : "password"}
            value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="••••••" icon={Icon.Lock} rightSlot={eyeBtn} t={T}
            onKeyDown={e => e.key === "Enter" && handleCadastro()} />
        )}

        {erro && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "#F871182A", border: "1px solid #F8711840",
            borderRadius: 10, padding: "11px 14px", marginBottom: 16,
            fontSize: 13, color: "#F87171",
          }}>
            <Icon.AlertCircle width={16} height={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {erro}
          </div>
        )}

        <button
          onClick={modo === "login" ? handleLogin : handleCadastro}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: loading ? "#2A2E38" : "linear-gradient(135deg, #3DDC84, #2BB865)",
            color: loading ? "#4A5260" : "#0D1A10",
            fontWeight: 900, fontSize: 16, cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
        >
          {loading
            ? <><Icon.Loader width={18} height={18} /> Aguarde...</>
            : modo === "login" ? "Entrar" : "Criar minha conta"
          }
        </button>

        {/* Info Supabase */}
        <div style={{
          marginTop: 20, padding: "13px 14px",
          background: "#3DDC840A", border: "1px solid #3DDC8420",
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 10, color: "#3DDC84", fontWeight: 700, marginBottom: 5, letterSpacing: 1 }}>
            AUTENTICAÇÃO VIA SUPABASE
          </div>
          <div style={{ fontSize: 11, color: "#8892A0", lineHeight: 1.6 }}>
            Configure suas credenciais em <code style={{ background: "#2A2E38", padding: "1px 5px", borderRadius: 4, color: "#3DDC84" }}>src/supabase.js</code> para ativar o login real.
          </div>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}

// ─── CARD DE EXERCÍCIO ────────────────────────────────────────────────────
function ExCard({ ex, i, done, onToggle, getCarga, setCarga, t }) {
  const cor = t.accent;
  return (
    <div style={{
      background: done ? `${cor}0C` : t.card,
      border: `1.5px solid ${done ? cor + "50" : t.border}`,
      borderRadius: 18, padding: "16px 16px 14px", marginBottom: 10,
      transition: "all 0.25s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{
            fontWeight: 700, fontSize: 15, lineHeight: 1.3,
            color: done ? cor : t.text, marginBottom: 8,
          }}>
            {ex.nome}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill color={t.accent} bg={t.tag}>
              <Icon.Repeat width={9} height={9} />
              {ex.series}×
            </Pill>
            <Pill color={t.accent2} bg={t.accent2 + "18"}>
              {ex.reps} reps
            </Pill>
            <Pill color={t.muted} bg={t.card2}>
              <Icon.Timer width={9} height={9} />
              {ex.descanso}
            </Pill>
          </div>
        </div>
        <button onClick={onToggle} style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${done ? cor : t.dim}`,
          background: done ? cor : "transparent",
          color: done ? "#000" : t.dim,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          {done && <Icon.Check width={16} height={16} />}
        </button>
      </div>

      {/* Dica */}
      {ex.dica && (
        <div style={{
          marginBottom: 12, fontSize: 11.5, color: t.muted,
          fontStyle: "italic", lineHeight: 1.5,
          paddingLeft: 10, borderLeft: `2px solid ${t.border}`,
        }}>
          {ex.dica}
        </div>
      )}

      {/* Inputs de carga */}
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: ex.series }, (_, s) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: t.dim, textAlign: "center", marginBottom: 4, fontWeight: 600 }}>S{s + 1}</div>
            <input
              type="number" placeholder="kg" value={getCarga(s)}
              onChange={e => setCarga(s, e.target.value)}
              style={{
                width: "100%", padding: "9px 4px", textAlign: "center",
                background: t.card2, border: `1.5px solid ${cor}30`,
                borderRadius: 10, color: cor, fontSize: 13, fontWeight: 700,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = cor + "80"}
              onBlur={e => e.target.style.borderColor = cor + "30"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEPPER NUMÉRICO ──────────────────────────────────────────────────────
function NumStepper({ label, value, setValue, min, max, unit, t }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: t.muted, marginBottom: 10, letterSpacing: 1.5, fontWeight: 700 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setValue(v => Math.max(min, v - 1))} style={{
          width: 48, height: 48, borderRadius: 14, border: `1.5px solid ${t.border}`,
          background: t.card2, color: t.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}>
          <Icon.Minus width={18} height={18} />
        </button>
        <div style={{
          flex: 1, height: 48, background: t.card,
          border: `2px solid ${t.accent}50`,
          borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 900, color: t.accent, gap: 6,
        }}>
          {value}
          <span style={{ fontSize: 13, fontWeight: 400, color: t.muted }}>{unit}</span>
        </div>
        <button onClick={() => setValue(v => Math.min(max, v + 1))} style={{
          width: 48, height: 48, borderRadius: 14, border: `1.5px solid ${t.border}`,
          background: t.card2, color: t.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon.Plus width={18} height={18} />
        </button>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [usuario, setUsuario] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Onboarding
  const [screen, setScreen] = useState("onboard");
  const [step, setStep] = useState(0);
  const [sexo, setSexo] = useState(null);
  const [objetivo, setObjetivo] = useState(null);
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(170);
  const [perfil, setPerfil] = useState(null);

  // Treino
  const [aba, setAba] = useState("treino");
  const [treinoSel, setTreinoSel] = useState("A");
  const [semana, setSemana] = useState(1);
  const [cargas, setCargas] = useState({});
  const [checks, setChecks] = useState({});
  const [menuAberto, setMenuAberto] = useState(false);

  // Verifica sessão salva
  useEffect(() => {
    const session = supabase.getSession();
    if (session?.access_token && session?.user) {
      const nomeUsuario = session.user.user_metadata?.nome || session.user.email.split("@")[0];
      setUsuario({ email: session.user.email, nome: nomeUsuario, token: session.access_token });
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100dvh", width: "100%", background: "#1A1C20", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon.Loader width={32} height={32} style={{ color: "#3DDC84" }} />
      </div>
    );
  }

  if (!usuario) return <AuthScreen onLogin={u => setUsuario(u)} />;

  const t = sexo ? TEMA[sexo] : TEMA.M;
  const plano = sexo ? PLANOS[sexo] : PLANOS.M;

  const ck = (tr, sem, ex, sr) => `${tr}-S${sem}-${ex}-${sr}`;
  const getC = (ex, sr) => cargas[ck(treinoSel, semana, ex, sr)] || "";
  const setC = (ex, sr, v) => setCargas(p => ({ ...p, [ck(treinoSel, semana, ex, sr)]: v }));
  const checkK = (tr, sem, ex) => `${tr}-S${sem}-${ex}`;
  const isDone = ex => !!checks[checkK(treinoSel, semana, ex)];
  const toggle = ex => setChecks(p => ({ ...p, [checkK(treinoSel, semana, ex)]: !p[checkK(treinoSel, semana, ex)] }));

  const exAtual = plano.treinos[treinoSel]?.exercicios || [];
  const totalDone = exAtual.filter((_, i) => isDone(i)).length;
  const progresso = exAtual.length ? Math.round((totalDone / exAtual.length) * 100) : 0;
  const fase = semana <= 4 ? ["ADAPTAÇÃO", "#4ADE80"] : semana <= 8 ? ["FORÇA", "#FBBF24"] : ["INTENSIDADE", "#F87171"];

  const imc = peso / ((altura / 100) ** 2);
  const imcStr = imc.toFixed(1);
  const imcInfo = imc < 18.5 ? ["Abaixo do peso", "#60A5FA"]
    : imc < 25 ? ["Peso ideal", "#4ADE80"]
    : imc < 30 ? ["Sobrepeso", "#FBBF24"] : ["Obesidade", "#F87171"];

  const accent0 = step === 0 ? "#C9A84C" : step === 1 ? (sexo === "F" ? "#C084FC" : "#3DDC84") : step === 2 ? "#60A5FA" : "#C9A84C";
  const objLabel = { hipertrofia: "Hipertrofia", emagrecimento: "Emagrecimento", manutencao: "Manutenção" };

  async function handleLogout() {
    if (usuario.token) await supabase.signOut(usuario.token);
    supabase.saveSession(null);
    setUsuario(null);
    setScreen("onboard"); setStep(0);
    setSexo(null); setObjetivo(null); setPerfil(null);
    setCargas({}); setChecks({}); setMenuAberto(false);
  }

  // ── ONBOARDING ────────────────────────────────────────────────────────
  if (screen === "onboard") {
    const canNext = (step === 0 && sexo) || (step === 1 && objetivo) || step >= 2;

    const stepBg = step === 0 ? "#1A1C20" : sexo === "F" ? "#1E1A24" : "#1A1C20";

    return (
      <div style={{
        minHeight: "100dvh", width: "100%", maxWidth: 440, margin: "0 auto",
        background: stepBg, color: "#E8EAF0",
        display: "flex", flexDirection: "column",
        transition: "background 0.4s",
      }}>
        {/* Topo */}
        <div style={{ padding: "20px 22px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#555", fontWeight: 700 }}>FICHAS DE TREINO MAX</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#8892A0" }}>
                Olá, {usuario.nome.split(" ")[0]} 👋
              </span>
              <button onClick={handleLogout} style={{
                background: "#22252C", border: "1px solid #32373F",
                borderRadius: 8, color: "#8892A0", fontSize: 11, padding: "5px 10px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <Icon.LogOut width={12} height={12} /> Sair
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 4 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= step ? accent0 : "#2A2A2A",
                transition: "background 0.4s",
              }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: "8px 22px 0", overflowY: "auto" }}>
          {/* STEP 0 — SEXO */}
          {step === 0 && (
            <div>
              <div style={{ fontSize: 27, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>Qual é o seu sexo?</div>
              <div style={{ fontSize: 13, color: "#778", marginBottom: 28 }}>Os treinos são completamente diferentes por sexo</div>
              {[
                { val: "M", label: "Masculino", sub: "Foco em força, volume e hipertrofia geral", emoji: "♂️", cor: "#3DDC84" },
                { val: "F", label: "Feminino", sub: "Foco em glúteos, posterior e definição", emoji: "♀️", cor: "#C084FC" },
              ].map(op => (
                <button key={op.val} onClick={() => setSexo(op.val)} style={{
                  width: "100%", padding: "18px 20px", marginBottom: 12,
                  background: sexo === op.val ? op.cor + "15" : "#22252C",
                  border: `2px solid ${sexo === op.val ? op.cor : "#2E323A"}`,
                  borderRadius: 18, display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 38 }}>{op.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: sexo === op.val ? op.cor : "#E8EAF0", marginBottom: 3 }}>{op.label}</div>
                    <div style={{ fontSize: 12, color: "#778" }}>{op.sub}</div>
                  </div>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${sexo === op.val ? op.cor : "#3A3F4A"}`,
                    background: sexo === op.val ? op.cor : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {sexo === op.val && <Icon.Check width={13} height={13} style={{ color: "#000" }} />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 1 — OBJETIVO */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 27, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>Seu objetivo</div>
              <div style={{ fontSize: 13, color: t.muted, marginBottom: 28 }}>Define seus macros e a intensidade do treino</div>
              {[
                { val: "hipertrofia", label: "Hipertrofia", sub: "Ganhar massa muscular e volume corporal", icon: Icon.Trophy, cor: t.accent },
                { val: "emagrecimento", label: "Emagrecimento", sub: "Perder gordura mantendo a massa magra", icon: Icon.Flame, cor: "#F87171" },
                { val: "manutencao", label: "Manutenção", sub: "Manter peso e melhorar composição corporal", icon: Icon.Scale, cor: "#FBBF24" },
              ].map(op => (
                <button key={op.val} onClick={() => setObjetivo(op.val)} style={{
                  width: "100%", padding: "16px 20px", marginBottom: 10,
                  background: objetivo === op.val ? op.cor + "12" : t.card,
                  border: `2px solid ${objetivo === op.val ? op.cor : t.border}`,
                  borderRadius: 18, display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: op.cor + "18", border: `1px solid ${op.cor}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <op.icon width={22} height={22} style={{ color: op.cor }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: objetivo === op.val ? op.cor : t.text, marginBottom: 3 }}>{op.label}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>{op.sub}</div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${objetivo === op.val ? op.cor : t.dim}`,
                    background: objetivo === op.val ? op.cor : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {objetivo === op.val && <Icon.Check width={12} height={12} style={{ color: "#000" }} />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — PESO E ALTURA */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 27, fontWeight: 900, marginBottom: 6 }}>Peso e altura</div>
              <div style={{ fontSize: 13, color: t.muted, marginBottom: 28 }}>Para calcular suas calorias e proteínas com precisão</div>
              <NumStepper label="PESO" value={peso} setValue={setPeso} min={40} max={200} unit="kg" t={t} />
              <NumStepper label="ALTURA" value={altura} setValue={setAltura} min={140} max={220} unit="cm" t={t} />
              {/* IMC */}
              <div style={{
                background: t.card, borderRadius: 16, padding: "16px 18px",
                border: `1px solid ${t.border}`, display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 10, color: t.muted, marginBottom: 4, letterSpacing: 1 }}>SEU IMC</div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: imcInfo[1], lineHeight: 1 }}>{imcStr}</div>
                  <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>kg/m²</div>
                </div>
                <div style={{
                  background: imcInfo[1] + "18", border: `1px solid ${imcInfo[1]}40`,
                  borderRadius: 12, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 13, color: imcInfo[1], fontWeight: 800 }}>{imcInfo[0]}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — RESUMO */}
          {step === 3 && (() => {
            const p = calcPerfil({ sexo, peso, altura, objetivo });
            const objIcon = { hipertrofia: Icon.Trophy, emagrecimento: Icon.Flame, manutencao: Icon.Scale }[objetivo];
            const ObjIcon = objIcon;
            return (
              <div>
                <div style={{ fontSize: 27, fontWeight: 900, marginBottom: 4 }}>Tudo pronto!</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>Seu plano personalizado está calculado</div>

                {/* Tags resumo */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                  {[
                    [sexo === "F" ? "♀️ Feminino" : "♂️ Masculino", t.accent],
                    [{ hipertrofia: "Hipertrofia", emagrecimento: "Emagrecimento", manutencao: "Manutenção" }[objetivo], t.accent2],
                    [`${peso} kg · ${altura} cm`, t.muted],
                  ].map(([txt, cor], i) => (
                    <div key={i} style={{
                      background: cor + "18", border: `1px solid ${cor}40`,
                      borderRadius: 20, padding: "5px 12px",
                      fontSize: 11, color: cor, fontWeight: 700,
                    }}>{txt}</div>
                  ))}
                </div>

                {/* Kcal */}
                <div style={{
                  background: `linear-gradient(135deg, ${t.card} 0%, ${t.card2} 100%)`,
                  border: `1px solid ${t.border}`, borderRadius: 20,
                  padding: "24px 20px", marginBottom: 14, textAlign: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                    <Icon.Zap width={13} height={13} style={{ color: t.muted }} />
                    <div style={{ fontSize: 10, color: t.muted, letterSpacing: 1.5, fontWeight: 700 }}>META CALÓRICA DIÁRIA</div>
                  </div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: t.accent, lineHeight: 1 }}>{p.kcal}</div>
                  <div style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>kcal / dia</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                    {[["TDEE", p.tdee + " kcal", t.dim], ["AJUSTE", (objetivo === "hipertrofia" ? "+300" : objetivo === "emagrecimento" ? "−400" : "0") + " kcal", t.accent2], ["ÁGUA", p.agua + " L", "#60A5FA"]].map(([lb, vl, cl], i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${t.border}` : "none" }}>
                        <div style={{ fontSize: 9, color: t.muted, letterSpacing: 1 }}>{lb}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: cl, marginTop: 4 }}>{vl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Macros */}
                <div style={{ display: "flex", gap: 8 }}>
                  <StatCard value={`${p.ptn}g`} label="PROTEÍNA" color={t.accent} t={t} icon={Icon.Weight} />
                  <StatCard value={`${p.cho}g`} label="CARBOIDRATO" color={t.accent2} t={t} icon={Icon.Zap} />
                  <StatCard value={`${p.gord}g`} label="GORDURA" color="#60A5FA" t={t} icon={Icon.Droplets} />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Botões fixos no fundo */}
        <div style={{ padding: "16px 22px 36px", flexShrink: 0 }}>
          <button
            onClick={() => {
              if (step === 3) { setPerfil(calcPerfil({ sexo, peso, altura, objetivo })); setScreen("app"); }
              else setStep(s => s + 1);
            }}
            disabled={!canNext}
            style={{
              width: "100%", padding: "17px", borderRadius: 16, border: "none",
              background: canNext ? accent0 : "#2A2E38",
              color: canNext ? "#000" : "#3A3F4A",
              fontWeight: 900, fontSize: 16, cursor: canNext ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
            {step === 3 ? <><Icon.Rocket width={18} height={18} /> Começar meu plano</> : <>Continuar <Icon.ChevronRight width={18} height={18} /></>}
          </button>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              width: "100%", padding: 12, marginTop: 4, border: "none",
              background: "transparent", color: t.muted, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <Icon.ChevronLeft width={15} height={15} /> Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── TELA PRINCIPAL ────────────────────────────────────────────────────
  const treinoAtual = plano.treinos[treinoSel];

  return (
    <div style={{
      minHeight: "100dvh", width: "100%", maxWidth: 440, margin: "0 auto",
      background: t.grad, color: t.text,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: t.headerGrad, borderBottom: `1px solid ${t.border}`,
        padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: t.accent + "18", border: `1px solid ${t.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.Dumbbell width={18} height={18} style={{ color: t.accent }} />
          </div>
          <div>
            <div style={{ fontSize: 8, color: t.accent, fontWeight: 700, letterSpacing: 3 }}>FICHAS DE TREINO</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: t.text, lineHeight: 1.1 }}>MAX</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: t.accent + "15", border: `1px solid ${t.accent}30`,
            borderRadius: 20, padding: "4px 10px", fontSize: 11, color: t.accent, fontWeight: 700,
          }}>
            {sexo === "F" ? "♀️" : "♂️"} {objLabel[objetivo]}
          </div>

          {/* Menu usuário */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuAberto(v => !v)} style={{
              width: 36, height: 36, borderRadius: 10,
              background: t.card, border: `1.5px solid ${menuAberto ? t.accent + "60" : t.border}`,
              color: menuAberto ? t.accent : t.muted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              <Icon.User width={17} height={17} />
            </button>

            {menuAberto && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 14, padding: "8px", minWidth: 190, zIndex: 20,
                boxShadow: "0 12px 32px #00000055",
              }}>
                <div style={{ padding: "10px 12px 10px", borderBottom: `1px solid ${t.border}`, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{usuario.nome}</div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{usuario.email}</div>
                </div>
                <button onClick={() => { setScreen("onboard"); setStep(0); setMenuAberto(false); }} style={{
                  width: "100%", padding: "9px 12px", border: "none", background: "none",
                  color: t.muted, fontSize: 13, cursor: "pointer", textAlign: "left", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 8, transition: "color 0.15s",
                }}>
                  <Icon.Edit width={14} height={14} /> Editar perfil
                </button>
                <button onClick={handleLogout} style={{
                  width: "100%", padding: "9px 12px", border: "none", background: "none",
                  color: "#F87171", fontSize: 13, cursor: "pointer", textAlign: "left", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon.LogOut width={14} height={14} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fecha menu */}
      {menuAberto && (
        <div onClick={() => setMenuAberto(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
      )}

      {/* Tabs */}
      <div style={{ display: "flex", background: t.card, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        {[
          ["treino", Icon.Dumbbell, "Treino"],
          ["macros", Icon.Utensils, "Macros"],
          ["semanas", Icon.Calendar, "Plano"],
        ].map(([id, Ic, label]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            flex: 1, padding: "12px 0", border: "none", background: "transparent",
            borderBottom: `2.5px solid ${aba === id ? t.accent : "transparent"}`,
            color: aba === id ? t.accent : t.dim,
            fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "color 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <Ic width={16} height={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── ABA TREINO ── */}
        {aba === "treino" && (
          <div style={{ padding: "16px 14px 24px" }}>
            {/* Seletor de treino */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: t.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>TREINO DO DIA</div>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.keys(plano.treinos).map(tr => {
                  const active = treinoSel === tr;
                  return (
                    <button key={tr} onClick={() => setTreinoSel(tr)} style={{
                      flex: 1, padding: "12px 0", borderRadius: 14,
                      border: `2px solid ${active ? t.accent : t.border}`,
                      background: active ? t.accent + "18" : t.card,
                      color: active ? t.accent : t.dim,
                      fontWeight: 900, fontSize: 20, cursor: "pointer", transition: "all 0.2s",
                    }}>{tr}</button>
                  );
                })}
              </div>
              <div style={{ marginTop: 10, padding: "10px 14px", background: t.card, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 12, color: t.accent, fontWeight: 700 }}>{treinoAtual?.nome}</div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>{treinoAtual?.desc}</div>
              </div>
            </div>

            {/* Semana */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: t.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>SEMANA</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {SEMANAS.map(s => (
                  <button key={s} onClick={() => setSemana(s)} style={{
                    width: 34, height: 34, borderRadius: 9,
                    border: `1.5px solid ${semana === s ? t.accent : t.border}`,
                    background: semana === s ? t.accent + "20" : t.card,
                    color: semana === s ? t.accent : t.dim,
                    fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.2s",
                  }}>S{s}</button>
                ))}
              </div>
              <div style={{
                padding: "10px 14px", borderRadius: 12,
                background: fase[1] + "12", border: `1px solid ${fase[1]}30`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: fase[1], flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 11, color: fase[1], fontWeight: 800 }}>{fase[0]}</span>
                  <span style={{ fontSize: 10, color: t.muted, marginLeft: 6 }}>
                    {semana <= 4 ? "Aprenda a técnica correta" : semana <= 8 ? "Aumente cargas progressivamente" : "Máxima intensidade e volume"}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de progresso */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: t.muted, letterSpacing: 1, fontWeight: 700 }}>PROGRESSO</span>
                <span style={{ fontSize: 11, color: t.accent, fontWeight: 700 }}>{totalDone}/{exAtual.length} exercícios · {progresso}%</span>
              </div>
              <div style={{ height: 6, background: t.card2, borderRadius: 3 }}>
                <div style={{
                  height: "100%", width: `${progresso}%`, borderRadius: 3,
                  background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* Lista de exercícios */}
            {exAtual.map((ex, i) => (
              <ExCard key={i} ex={ex} i={i}
                done={isDone(i)} onToggle={() => toggle(i)}
                getCarga={s => getC(i, s)} setCarga={(s, v) => setC(i, s, v)}
                t={t}
              />
            ))}
          </div>
        )}

        {/* ── ABA MACROS ── */}
        {aba === "macros" && perfil && (
          <div style={{ padding: "16px 14px 24px" }}>
            <div style={{ fontSize: 9, color: t.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 18 }}>
              PLANO NUTRICIONAL PERSONALIZADO
            </div>

            {/* Kcal hero */}
            <div style={{
              background: `linear-gradient(135deg, ${t.card} 0%, ${t.card2} 100%)`,
              border: `1px solid ${t.border}`, borderRadius: 20,
              padding: "24px 20px", marginBottom: 14, textAlign: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                <Icon.Zap width={12} height={12} style={{ color: t.muted }} />
                <div style={{ fontSize: 10, color: t.muted, letterSpacing: 1.5, fontWeight: 700 }}>META CALÓRICA DIÁRIA</div>
              </div>
              <div style={{ fontSize: 58, fontWeight: 900, color: t.accent, lineHeight: 1 }}>{perfil.kcal}</div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 6 }}>kcal por dia</div>
              <div style={{ display: "flex", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                {[["GASTO", perfil.tdee + " kcal", t.muted], ["AJUSTE", (objetivo === "hipertrofia" ? "+300" : objetivo === "emagrecimento" ? "−400" : "0") + " kcal", t.accent2], ["ÁGUA", perfil.agua + " L", "#60A5FA"]].map(([lb, vl, cl], i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${t.border}` : "none" }}>
                    <div style={{ fontSize: 9, color: t.muted, letterSpacing: 1 }}>{lb}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: cl, marginTop: 4 }}>{vl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macros */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <StatCard value={`${perfil.ptn}g`} label="PROTEÍNA" color={t.accent} t={t} icon={Icon.Weight} />
              <StatCard value={`${perfil.cho}g`} label="CARBO" color={t.accent2} t={t} icon={Icon.Zap} />
              <StatCard value={`${perfil.gord}g`} label="GORDURA" color="#60A5FA" t={t} icon={Icon.Droplets} />
            </div>

            {/* Distribuição proteína */}
            <div style={{ background: t.card, borderRadius: 18, padding: "18px 16px", border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Icon.Utensils width={14} height={14} style={{ color: t.muted }} />
                <div style={{ fontSize: 10, color: t.muted, letterSpacing: 1.5, fontWeight: 700 }}>DISTRIBUIÇÃO DE PROTEÍNA</div>
              </div>
              {[["☀️ Café da manhã", 0.22], ["🥗 Almoço", 0.30], ["🍎 Lanche", 0.18], ["🌙 Jantar", 0.22], ["🌛 Ceia", 0.08]].map(([ref, pct]) => {
                const val = Math.round(perfil.ptn * pct);
                return (
                  <div key={ref} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: t.text }}>{ref}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>{val}g</span>
                    </div>
                    <div style={{ height: 4, background: t.card2, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${Math.round(pct * 320)}px`, maxWidth: "100%", background: `linear-gradient(90deg, ${t.accent}90, ${t.accent}50)`, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ABA PLANO ── */}
        {aba === "semanas" && (
          <div style={{ padding: "16px 14px 24px" }}>
            <div style={{ fontSize: 9, color: t.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 16 }}>PERIODIZAÇÃO 12 SEMANAS</div>
            {[
              ["1–4", "ADAPTAÇÃO", "Técnica e execução. Aprenda o movimento correto.", "#4ADE80", 1, 4],
              ["5–8", "FORÇA", "Aumente as cargas progressivamente toda semana.", "#FBBF24", 5, 8],
              ["9–12", "INTENSIDADE", "Drop sets, bi-sets e máxima intensidade.", "#F87171", 9, 12],
            ].map(([faixa, nome, desc, c, start, end]) => (
              <div key={faixa} style={{ marginBottom: 14 }}>
                <div style={{
                  background: c + "20", border: `1px solid ${c}40`,
                  borderRadius: "14px 14px 0 0", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 9, color: c, fontWeight: 700, letterSpacing: 1 }}>SEMANAS {faixa}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: c }}>{nome}</div>
                  </div>
                </div>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 16px 14px" }}>
                  <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 12, lineHeight: 1.5 }}>{desc}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(s => (
                      <button key={s} onClick={() => { setSemana(s); setAba("treino"); }} style={{
                        padding: "7px 13px", borderRadius: 9,
                        border: `1.5px solid ${semana === s ? c + "70" : t.border}`,
                        background: semana === s ? c + "18" : t.card2,
                        color: semana === s ? c : t.dim,
                        fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                      }}>S{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Divisão semanal */}
            <div style={{ fontSize: 9, color: t.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 12, marginTop: 4 }}>
              DIVISÃO SEMANAL — {sexo === "F" ? "PLANO FEMININO" : "PLANO MASCULINO"}
            </div>
            {plano.divisao.map(({ dia, treino: tr, foco }) => {
              const isRest = tr === "—", isHit = tr === "HIT";
              const isCurrent = !isRest && !isHit && tr === treinoSel;
              const cor = isRest ? t.dim : isHit ? "#F87171" : t.accent;
              return (
                <div key={dia} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: isCurrent ? t.accent + "10" : t.card,
                  border: `1.5px solid ${isCurrent ? t.accent + "40" : t.border}`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 6,
                  cursor: !isRest && !isHit ? "pointer" : "default",
                  transition: "all 0.2s",
                }} onClick={() => !isRest && !isHit && (setTreinoSel(tr), setAba("treino"))}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: t.dim, width: 32 }}>{dia}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: cor + "20", border: `1px solid ${cor}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: isRest ? 16 : 13, color: cor,
                  }}>
                    {isRest ? "·" : tr}
                  </div>
                  <span style={{ fontSize: 13, color: isRest ? t.dim : t.text, flex: 1 }}>{foco}</span>
                  {isCurrent && (
                    <span style={{
                      fontSize: 9, color: t.accent, fontWeight: 800,
                      background: t.accent + "18", border: `1px solid ${t.accent}30`,
                      borderRadius: 20, padding: "3px 8px", letterSpacing: 0.5,
                    }}>ATUAL</span>
                  )}
                  {!isRest && !isHit && <Icon.ChevronRight width={14} height={14} style={{ color: t.dim }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
