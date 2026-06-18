import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// ─── ANIMATIONS ───────────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #16101E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  input, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #6B21A8; border-radius: 2px; }
`;
document.head.appendChild(styleEl);

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#16101E",
  bg2: "#1E1628",
  card: "#211830",
  card2: "#2A1E3A",
  border: "#3D2D55",
  accent: "#E040FB",
  accent2: "#F06292",
  accent3: "#FF8A65",
  gold: "#FFD54F",
  text: "#F3ECF9",
  muted: "#9B8AB0",
  dim: "#5A4A70",
  grad: "linear-gradient(135deg, #16101E 0%, #1E1628 100%)",
  gradAccent: "linear-gradient(135deg, #E040FB 0%, #F06292 100%)",
  gradGold: "linear-gradient(135deg, #FFD54F 0%, #FF8A65 100%)",
  gradCard: "linear-gradient(160deg, #211830 0%, #2A1E3A 100%)",
  shadow: "0 8px 32px rgba(224,64,251,0.15)",
  shadowCard: "0 4px 20px rgba(0,0,0,0.4)",
};

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────
const TREINOS = {
  A: {
    nome: "GLÚTEO SUPERIOR",
    emoji: "🍑",
    desc: "Foco em ativação do glúteo máximo superior e quadríceps",
    cor: "#E040FB",
    exercicios: [
      { nome: "Hip Thrust com Barra", series: 4, reps: "10–15", descanso: "90s", dica: "Empurre o quadril para cima contraindo forte no topo. Pés afastados na largura dos ombros.", musculo: "Glúteo Máximo" },
      { nome: "Agachamento Livre", series: 4, reps: "8–12", descanso: "90s", dica: "Desça até as coxas ficarem paralelas ao chão. Joelhos acompanham os pés.", musculo: "Glúteo + Quad" },
      { nome: "Leg Press 45° (pés altos)", series: 3, reps: "12–15", descanso: "75s", dica: "Coloque os pés mais altos e afastados para ativar mais os glúteos.", musculo: "Glúteo + Quad" },
      { nome: "Afundo com Halteres", series: 3, reps: "12 cada perna", descanso: "75s", dica: "Dê um passo largo à frente. Joelho traseiro quase toca o chão.", musculo: "Glúteo + Quad" },
      { nome: "Cadeira Abdutora", series: 3, reps: "15–20", descanso: "60s", dica: "Realize o movimento completo e segure 1 segundo no ponto máximo.", musculo: "Glúteo Médio" },
      { nome: "Extensão de Quadril no Cabo", series: 3, reps: "15 cada lado", descanso: "60s", dica: "Fixe o core e empurre a perna para trás e para cima contraindo o glúteo.", musculo: "Glúteo Máximo" },
    ],
  },
  B: {
    nome: "GLÚTEO INFERIOR",
    emoji: "💪",
    desc: "Posterior de coxa, glúteo inferior e definição",
    cor: "#F06292",
    exercicios: [
      { nome: "Stiff com Barra", series: 4, reps: "10–12", descanso: "90s", dica: "Mantenha a barra próxima ao corpo e a coluna neutra. Sinta o alongamento no posterior.", musculo: "Glúteo + Posterior" },
      { nome: "Mesa Flexora", series: 3, reps: "12–15", descanso: "75s", dica: "Flexione de forma controlada e desça lentamente (3 segundos de descida).", musculo: "Posterior de Coxa" },
      { nome: "Elevação Pélvica no Solo", series: 4, reps: "20–25", descanso: "60s", dica: "Eleve o quadril e contraia por 2 segundos no topo. Pode usar peso no abdômen.", musculo: "Glúteo Máximo" },
      { nome: "Cadeira Adutora", series: 3, reps: "15–20", descanso: "60s", dica: "Realize o movimento de forma controlada para definição interna da coxa.", musculo: "Adutores" },
      { nome: "Agachamento Sumô", series: 3, reps: "15–20", descanso: "75s", dica: "Pés bem afastados e apontados para fora. Desça profundo entre as pernas.", musculo: "Glúteo + Adutores" },
      { nome: "Coice no Pulley (pé preso)", series: 3, reps: "15 cada lado", descanso: "60s", dica: "Contraia o glúteo no topo do movimento. Não balance o tronco.", musculo: "Glúteo Máximo" },
    ],
  },
  C: {
    nome: "GLÚTEO MÉDIO",
    emoji: "✨",
    desc: "Arredondamento lateral e modelagem do glúteo",
    cor: "#FF8A65",
    exercicios: [
      { nome: "Abdução com Elástico (side walk)", series: 3, reps: "20 passos cada lado", descanso: "60s", dica: "Mantenha a tensão no elástico e passos laterais controlados.", musculo: "Glúteo Médio" },
      { nome: "Elevação Lateral de Perna (deitada)", series: 3, reps: "20 cada lado", descanso: "60s", dica: "Eleve a perna de forma controlada com o pé em dorsiflexão (ponta para cima).", musculo: "Glúteo Médio" },
      { nome: "Agachamento Sumô com Halter", series: 3, reps: "15–20", descanso: "75s", dica: "Segure o halter no centro. Desça devagar e suba contraindo glúteos.", musculo: "Glúteo + Adutores" },
      { nome: "Hip Thrust Unilateral", series: 3, reps: "12 cada lado", descanso: "75s", dica: "Apoie os ombros no banco, uma perna estendida. Empurre o quadril para cima.", musculo: "Glúteo Máximo" },
      { nome: "Abdução no Cabo em Pé", series: 3, reps: "15 cada lado", descanso: "60s", dica: "Mantenha o tronco estável e abduz a perna para o lado de forma controlada.", musculo: "Glúteo Médio" },
      { nome: "Agachamento Búlgaro", series: 3, reps: "10 cada perna", descanso: "90s", dica: "Pé traseiro elevado no banco. Desça profundo para máxima ativação do glúteo.", musculo: "Glúteo + Quad" },
    ],
  },
  D: {
    nome: "FULL GLÚTEO",
    emoji: "🔥",
    desc: "Treino completo integrando todos os feixes do glúteo",
    cor: "#FFD54F",
    exercicios: [
      { nome: "Hip Thrust com Barra (pesado)", series: 5, reps: "6–10", descanso: "120s", dica: "Dia de força máxima. Adicione carga progressiva a cada semana.", musculo: "Glúteo Máximo" },
      { nome: "Agachamento Hack Machine", series: 3, reps: "12–15", descanso: "75s", dica: "Pés altos na plataforma para ativar glúteo. Controle a descida.", musculo: "Glúteo + Quad" },
      { nome: "Stiff Unilateral com Halter", series: 3, reps: "12 cada lado", descanso: "75s", dica: "Melhora o equilíbrio e ativa mais profundamente o glúteo de cada lado.", musculo: "Glúteo + Posterior" },
      { nome: "Coice com Elástico no Solo", series: 3, reps: "20 cada lado", descanso: "60s", dica: "Quatro apoios. Empurre o calcanhar para o teto contraindo o glúteo.", musculo: "Glúteo Máximo" },
      { nome: "Cadeira Abdutora (drop set)", series: 3, reps: "15 + 15 drop", descanso: "60s", dica: "Faça 15 reps, reduza o peso imediatamente e faça mais 15 sem parar.", musculo: "Glúteo Médio" },
      { nome: "Extensão de Quadril 45° (mesa)", series: 3, reps: "15 cada lado", descanso: "60s", dica: "Mesa de 45 graus. Estenda o quadril e contraia forte no topo.", musculo: "Glúteo Máximo" },
      { nome: "Panturrilha em Pé", series: 3, reps: "20–25", descanso: "45s", dica: "Complementar para definição da perna. Suba nas pontas dos pés e segure 1s.", musculo: "Panturrilha" },
    ],
  },
};

const DIVISAO_SEMANAL = [
  { dia: "SEG", treino: "A", foco: "Glúteo Superior" },
  { dia: "TER", treino: "B", foco: "Glúteo Inferior" },
  { dia: "QUA", treino: "—", foco: "Cardio Leve / Descanso" },
  { dia: "QUI", treino: "C", foco: "Glúteo Médio" },
  { dia: "SEX", treino: "D", foco: "Full Glúteo 🔥" },
  { dia: "SAB", treino: "—", foco: "Caminhada 40min" },
  { dia: "DOM", treino: "—", foco: "Descanso Total" },
];

const FASES = [
  { semanas: "1–4", nome: "Ativação", desc: "Aprender os movimentos e ativar corretamente o glúteo", cor: "#C084FC" },
  { semanas: "5–8", nome: "Hipertrofia", desc: "Aumento de carga progressiva para crescimento máximo", cor: "#F06292" },
  { semanas: "9–12", nome: "Intensidade", desc: "Técnicas avançadas: drop sets, supersets e peak contraction", cor: "#FF8A65" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcIMC = (peso, altura) => {
  const h = altura / 100;
  return peso / (h * h);
};

const imcLabel = (imc) => {
  if (imc < 18.5) return { label: "Abaixo do peso", cor: "#64B5F6" };
  if (imc < 25) return { label: "Peso normal ✓", cor: "#81C784" };
  if (imc < 30) return { label: "Sobrepeso", cor: "#FFB74D" };
  return { label: "Obesidade", cor: "#E57373" };
};

const calcMacros = (peso, altura, objetivo) => {
  const tmb = 655 + 9.6 * peso + 1.8 * altura - 4.7 * 30;
  const tdee = tmb * 1.55;
  const adj = objetivo === "hipertrofia" ? 300 : objetivo === "emagrecer" ? -400 : 0;
  const kcal = Math.round(tdee + adj);
  const ptn = Math.round(peso * 2.0);
  const fat = Math.round((kcal * 0.25) / 9);
  const carb = Math.round((kcal - ptn * 4 - fat * 9) / 4);
  return { kcal, ptn, carb, fat };
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
const Btn = ({ children, onClick, style = {}, variant = "primary", disabled = false }) => {
  const base = {
    padding: "14px 24px",
    borderRadius: 14,
    border: "none",
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .2s",
    opacity: disabled ? 0.6 : 1,
    letterSpacing: ".5px",
  };
  const variants = {
    primary: { background: T.gradAccent, color: "#fff", boxShadow: "0 4px 20px rgba(224,64,251,0.35)" },
    secondary: { background: T.card2, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.muted, padding: "10px 16px" },
    gold: { background: T.gradGold, color: "#1A1020", boxShadow: "0 4px 20px rgba(255,213,79,0.3)" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: T.gradCard,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: 20,
      boxShadow: T.shadowCard,
      cursor: onClick ? "pointer" : "default",
      transition: "transform .15s",
      animation: "fadeIn .4s ease",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, cor }) => (
  <span style={{
    background: cor + "22",
    color: cor,
    border: `1px solid ${cor}44`,
    borderRadius: 8,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".5px",
  }}>{children}</span>
);

const ProgressBar = ({ pct, cor = T.accent, height = 8 }) => (
  <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(100, pct)}%`,
      height: "100%",
      background: cor,
      borderRadius: 99,
      transition: "width .5s ease",
    }} />
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ color: T.muted, fontSize: 13, fontWeight: 600, letterSpacing: ".5px" }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: T.card2,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: icon ? "14px 14px 14px 44px" : "14px",
          color: T.text,
          fontSize: 16,
          outline: "none",
        }}
      />
    </div>
  </div>
);

const Stepper = ({ label, value, onChange, min = 0, max = 999, unit = "" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
    <span style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.card2, borderRadius: 14, padding: "8px 16px", border: `1px solid ${T.border}` }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ background: T.border, border: "none", borderRadius: 8, width: 32, height: 32, color: T.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
      <span style={{ color: T.text, fontSize: 22, fontWeight: 700, minWidth: 60, textAlign: "center" }}>{value}{unit}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ background: T.gradAccent, border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
    </div>
  </div>
);

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handle = async () => {
    if (!email || !pass) return setMsg({ type: "error", text: "Preencha e-mail e senha" });
    setLoading(true);
    setMsg(null);
    try {
      let res;
      if (mode === "login") {
        res = await supabase.auth.signInWithPassword({ email, password: pass });
      } else {
        res = await supabase.auth.signUp({ email, password: pass });
        if (!res.error && res.data?.user) {
          setConfirmed(true);
          setLoading(false);
          return;
        }
      }
      if (res.error) throw res.error;
      onAuth(res.data.user);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Erro ao autenticar" });
    }
    setLoading(false);
  };

  if (confirmed) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
        <h2 style={{ color: T.text, margin: "0 0 8px" }}>Confirme seu e-mail</h2>
        <p style={{ color: T.muted, margin: "0 0 20px" }}>Enviamos um link de confirmação para <strong style={{ color: T.accent }}>{email}</strong>. Clique no link e volte para fazer login.</p>
        <Btn onClick={() => { setConfirmed(false); setMode("login"); }} variant="secondary" style={{ width: "100%" }}>Ir para Login</Btn>
      </Card>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeIn .6s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: "heartbeat 2s infinite" }}>🍑</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, background: T.gradAccent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GluteoMax</h1>
        <p style={{ color: T.muted, margin: "6px 0 0", fontSize: 14 }}>Transforme seu glúteo em 12 semanas</p>
      </div>

      <Card style={{ maxWidth: 400, width: "100%" }}>
        {/* Toggle */}
        <div style={{ display: "flex", background: T.bg, borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
          {["login", "cadastro"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "10px", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer",
              background: mode === m ? T.gradAccent : "transparent",
              color: mode === m ? "#fff" : T.muted,
              transition: "all .2s",
            }}>
              {m === "login" ? "Entrar" : "Criar Conta"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" icon="📧" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handle()}
                style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 44px", color: T.text, fontSize: 16, outline: "none" }}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {msg && (
            <div style={{ background: msg.type === "error" ? "#E5393522" : "#2E7D3222", border: `1px solid ${msg.type === "error" ? "#E5393555" : "#2E7D3255"}`, borderRadius: 10, padding: "10px 14px", color: msg.type === "error" ? "#EF9A9A" : "#A5D6A7", fontSize: 14 }}>
              {msg.text}
            </div>
          )}

          <Btn onClick={handle} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "⏳ Aguarde..." : mode === "login" ? "🚀 Entrar" : "✨ Criar Conta Grátis"}
          </Btn>
        </div>
      </Card>

      <p style={{ color: T.dim, fontSize: 12, marginTop: 24, textAlign: "center" }}>
        Ao continuar, você concorda com nossos termos de uso
      </p>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ objetivo: "", peso: 65, altura: 165, nivel: "" });

  const objetivos = [
    { id: "hipertrofia", emoji: "🍑", label: "Crescer o Glúteo", desc: "Máxima hipertrofia e volume" },
    { id: "definir", emoji: "✨", label: "Definir e Empinar", desc: "Tonificar com volume moderado" },
    { id: "emagrecer", emoji: "🔥", label: "Emagrecer e Modelar", desc: "Perda de gordura com treino intenso" },
  ];

  const niveis = [
    { id: "iniciante", emoji: "🌱", label: "Iniciante", desc: "Menos de 6 meses de treino" },
    { id: "intermediario", emoji: "💪", label: "Intermediária", desc: "6 meses a 2 anos de treino" },
    { id: "avancada", emoji: "🏆", label: "Avançada", desc: "Mais de 2 anos de treino" },
  ];

  const imc = calcIMC(data.peso, data.altura);
  const imcInfo = imcLabel(imc);
  const macros = data.objetivo ? calcMacros(data.peso, data.altura, data.objetivo === "emagrecer" ? "emagrecer" : data.objetivo === "hipertrofia" ? "hipertrofia" : "manter") : null;

  const steps = [
    // Step 0: Objective
    <div key={0} style={{ animation: "slideUp .4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
        <h2 style={{ color: T.text, margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Qual é o seu objetivo?</h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 15 }}>Seu plano será personalizado para você</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {objetivos.map(o => (
          <div key={o.id} onClick={() => { setData(d => ({ ...d, objetivo: o.id })); setTimeout(() => setStep(1), 250); }}
            style={{
              background: data.objetivo === o.id ? T.accent + "22" : T.card2,
              border: `2px solid ${data.objetivo === o.id ? T.accent : T.border}`,
              borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "all .2s",
              display: "flex", alignItems: "center", gap: 16,
            }}>
            <span style={{ fontSize: 36 }}>{o.emoji}</span>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 17 }}>{o.label}</div>
              <div style={{ color: T.muted, fontSize: 14 }}>{o.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 1: Level
    <div key={1} style={{ animation: "slideUp .4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>💪</div>
        <h2 style={{ color: T.text, margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Qual seu nível?</h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 15 }}>Adaptaremos a intensidade para você</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {niveis.map(n => (
          <div key={n.id} onClick={() => { setData(d => ({ ...d, nivel: n.id })); setTimeout(() => setStep(2), 250); }}
            style={{
              background: data.nivel === n.id ? T.accent + "22" : T.card2,
              border: `2px solid ${data.nivel === n.id ? T.accent : T.border}`,
              borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "all .2s",
              display: "flex", alignItems: "center", gap: 16,
            }}>
            <span style={{ fontSize: 36 }}>{n.emoji}</span>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 17 }}>{n.label}</div>
              <div style={{ color: T.muted, fontSize: 14 }}>{n.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 2: Body stats
    <div key={2} style={{ animation: "slideUp .4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📏</div>
        <h2 style={{ color: T.text, margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Seus dados corporais</h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 15 }}>Para calcular suas calorias e macros</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Stepper label="Peso" value={data.peso} onChange={v => setData(d => ({ ...d, peso: v }))} min={30} max={200} unit="kg" />
          <Stepper label="Altura" value={data.altura} onChange={v => setData(d => ({ ...d, altura: v }))} min={140} max={220} unit="cm" />
        </div>
        {/* IMC */}
        <Card style={{ textAlign: "center", padding: 16 }}>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Seu IMC</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: imcInfo.cor }}>{imc.toFixed(1)}</div>
          <div style={{ color: imcInfo.cor, fontSize: 14, fontWeight: 600 }}>{imcInfo.label}</div>
        </Card>
        <Btn onClick={() => setStep(3)} style={{ width: "100%" }}>Continuar →</Btn>
      </div>
    </div>,

    // Step 3: Nutrition summary
    <div key={3} style={{ animation: "slideUp .4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🥗</div>
        <h2 style={{ color: T.text, margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Seu plano nutricional</h2>
        <p style={{ color: T.muted, margin: 0, fontSize: 15 }}>Personalizado para o seu objetivo</p>
      </div>
      {macros && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Calorie card */}
          <Card style={{ textAlign: "center", background: `linear-gradient(135deg, ${T.accent}22, ${T.accent2}22)`, borderColor: T.accent + "44" }}>
            <div style={{ color: T.muted, fontSize: 13 }}>Meta Calórica Diária</div>
            <div style={{ fontSize: 48, fontWeight: 900, background: T.gradAccent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{macros.kcal}</div>
            <div style={{ color: T.muted, fontSize: 13 }}>kcal/dia</div>
          </Card>
          {/* Macros */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Proteína", value: macros.ptn, unit: "g", cor: "#E040FB", emoji: "💪" },
              { label: "Carboidrato", value: macros.carb, unit: "g", cor: "#64B5F6", emoji: "🍠" },
              { label: "Gordura", value: macros.fat, unit: "g", cor: "#FFB74D", emoji: "🥑" },
            ].map(m => (
              <Card key={m.label} style={{ textAlign: "center", padding: 14 }}>
                <div style={{ fontSize: 24 }}>{m.emoji}</div>
                <div style={{ color: m.cor, fontSize: 22, fontWeight: 800 }}>{m.value}<span style={{ fontSize: 12 }}>{m.unit}</span></div>
                <div style={{ color: T.muted, fontSize: 11 }}>{m.label}</div>
              </Card>
            ))}
          </div>
          {/* Water */}
          <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
            <span style={{ fontSize: 32 }}>💧</span>
            <div>
              <div style={{ color: T.text, fontWeight: 700 }}>{(data.peso * 0.035).toFixed(1)} litros/dia</div>
              <div style={{ color: T.muted, fontSize: 13 }}>Hidratação recomendada</div>
            </div>
          </Card>
          <Btn onClick={() => onComplete(data)} style={{ width: "100%", marginTop: 8 }} variant="gold">
            🍑 Começar minha transformação!
          </Btn>
        </div>
      )}
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 440, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        )}
        <div style={{ flex: 1 }}>
          <ProgressBar pct={(step / 3) * 100} cor={T.accent} height={6} />
        </div>
        <span style={{ color: T.muted, fontSize: 13 }}>{step + 1}/4</span>
      </div>

      <div style={{ width: "100%", maxWidth: 440 }}>
        {steps[step]}
      </div>
    </div>
  );
}

// ─── WORKOUT TAB ──────────────────────────────────────────────────────────────
function WorkoutTab({ semana, perfil }) {
  const [treinoAtivo, setTreinoAtivo] = useState("A");
  const [cargas, setCargas] = useState({});
  const [feitos, setFeitos] = useState({});
  const [exExpandido, setExExpandido] = useState(null);

  const treino = TREINOS[treinoAtivo];
  const totalEx = treino.exercicios.length;
  const doneEx = treino.exercicios.filter((_, i) => feitos[`${treinoAtivo}-${semana}-${i}`]).length;
  const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;

  const setCarga = (key, val) => setCargas(c => ({ ...c, [key]: val }));
  const toggleFeito = (key) => setFeitos(f => ({ ...f, [key]: !f[key] }));

  const faseAtual = semana <= 4 ? FASES[0] : semana <= 8 ? FASES[1] : FASES[2];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Phase badge */}
      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
        <div>
          <div style={{ color: T.muted, fontSize: 12, fontWeight: 600 }}>SEMANA {semana} • FASE</div>
          <div style={{ color: faseAtual.cor, fontWeight: 800, fontSize: 18 }}>{faseAtual.nome}</div>
        </div>
        <Badge cor={faseAtual.cor}>{faseAtual.desc.split(" ").slice(0, 2).join(" ")}</Badge>
      </Card>

      {/* Workout selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {Object.entries(TREINOS).map(([k, t]) => (
          <button key={k} onClick={() => { setTreinoAtivo(k); setExExpandido(null); }} style={{
            background: treinoAtivo === k ? t.cor + "22" : T.card2,
            border: `2px solid ${treinoAtivo === k ? t.cor : T.border}`,
            borderRadius: 14, padding: "12px 8px", cursor: "pointer", transition: "all .2s", textAlign: "center",
          }}>
            <div style={{ fontSize: 22 }}>{t.emoji}</div>
            <div style={{ color: treinoAtivo === k ? t.cor : T.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>Treino {k}</div>
          </button>
        ))}
      </div>

      {/* Workout header */}
      <Card style={{ background: `linear-gradient(135deg, ${treino.cor}22, transparent)`, borderColor: treino.cor + "44" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{treino.emoji}</span>
          <div>
            <div style={{ color: treino.cor, fontWeight: 800, fontSize: 18, letterSpacing: "1px" }}>{treino.nome}</div>
            <div style={{ color: T.muted, fontSize: 13 }}>{treino.desc}</div>
          </div>
        </div>
        <ProgressBar pct={pct} cor={treino.cor} height={8} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: T.muted, fontSize: 13 }}>{doneEx}/{totalEx} exercícios</span>
          <span style={{ color: treino.cor, fontWeight: 700, fontSize: 13 }}>{pct}%</span>
        </div>
      </Card>

      {/* Exercise list */}
      {treino.exercicios.map((ex, i) => {
        const feitoKey = `${treinoAtivo}-${semana}-${i}`;
        const feito = feitos[feitoKey];
        const expanded = exExpandido === i;

        return (
          <Card key={i} style={{ opacity: feito ? 0.75 : 1, borderColor: feito ? treino.cor + "66" : T.border }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }} onClick={() => setExExpandido(expanded ? null : i)}>
              {/* Check */}
              <button onClick={e => { e.stopPropagation(); toggleFeito(feitoKey); }} style={{
                width: 28, height: 28, borderRadius: 8, border: `2px solid ${feito ? treino.cor : T.border}`,
                background: feito ? treino.cor : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, transition: "all .2s",
              }}>{feito ? "✓" : ""}</button>

              <div style={{ flex: 1 }}>
                <div style={{ color: feito ? T.muted : T.text, fontWeight: 700, fontSize: 16, textDecoration: feito ? "line-through" : "none" }}>{ex.nome}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <Badge cor={treino.cor}>{ex.series} séries</Badge>
                  <Badge cor="#64B5F6">{ex.reps} reps</Badge>
                  <Badge cor="#81C784">⏱ {ex.descanso}</Badge>
                </div>
              </div>
              <span style={{ color: T.dim, fontSize: 18, marginTop: 4 }}>{expanded ? "▲" : "▼"}</span>
            </div>

            {expanded && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, animation: "fadeIn .2s ease" }}>
                {/* Muscle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>💪</span>
                  <span style={{ color: treino.cor, fontWeight: 600, fontSize: 14 }}>{ex.musculo}</span>
                </div>
                {/* Tip */}
                <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", marginBottom: 14, borderLeft: `3px solid ${treino.cor}` }}>
                  <div style={{ color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>DICA DE EXECUÇÃO</div>
                  <div style={{ color: T.text, fontSize: 14, lineHeight: 1.5 }}>{ex.dica}</div>
                </div>
                {/* Load tracking */}
                <div style={{ color: T.muted, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>CARGA POR SÉRIE (kg)</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${ex.series}, 1fr)`, gap: 8 }}>
                  {Array.from({ length: ex.series }, (_, s) => {
                    const key = `${treinoAtivo}-S${semana}-${i}-${s}`;
                    return (
                      <div key={s} style={{ textAlign: "center" }}>
                        <div style={{ color: T.dim, fontSize: 12, marginBottom: 4 }}>S{s + 1}</div>
                        <input
                          type="number"
                          value={cargas[key] || ""}
                          onChange={e => setCarga(key, e.target.value)}
                          placeholder="—"
                          style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 4px", color: T.text, fontSize: 15, textAlign: "center", outline: "none" }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {doneEx === totalEx && totalEx > 0 && (
        <Card style={{ textAlign: "center", background: `linear-gradient(135deg, ${treino.cor}22, transparent)`, borderColor: treino.cor + "66" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ color: treino.cor, fontWeight: 800, fontSize: 20 }}>Treino concluído!</div>
          <div style={{ color: T.muted, fontSize: 14, marginTop: 4 }}>Incrível! Você está mais perto do seu glúteo dos sonhos 🍑</div>
        </Card>
      )}
    </div>
  );
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────
function NutritionTab({ perfil }) {
  const macros = calcMacros(perfil.peso, perfil.altura, perfil.objetivo === "emagrecer" ? "emagrecer" : perfil.objetivo === "hipertrofia" ? "hipertrofia" : "manter");

  const refeicoes = [
    { nome: "☀️ Café da Manhã", horario: "7h–8h", pct: 25 },
    { nome: "🍎 Lanche da Manhã", horario: "10h", pct: 10 },
    { nome: "🍽️ Almoço", horario: "12h–13h", pct: 35 },
    { nome: "🥤 Lanche da Tarde", horario: "16h", pct: 15 },
    { nome: "🌙 Jantar", horario: "19h–20h", pct: 15 },
  ];

  const dicas = [
    { emoji: "🥩", texto: "Priorize proteínas em cada refeição (frango, ovo, peixe)" },
    { emoji: "🍠", texto: "Carboidratos complexos: batata-doce, arroz integral, aveia" },
    { emoji: "🥑", texto: "Gorduras boas: azeite, abacate, castanhas" },
    { emoji: "💧", texto: `Beba ${(perfil.peso * 0.035).toFixed(1)}L de água por dia` },
    { emoji: "⏰", texto: "Coma a cada 3–4 horas para manter o metabolismo ativo" },
    { emoji: "🏋️", texto: "Consuma proteína até 2h após o treino para máxima recuperação" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Calorie goal */}
      <Card style={{ textAlign: "center", background: `linear-gradient(135deg, ${T.accent}22, ${T.accent2}22)`, borderColor: T.accent + "44" }}>
        <div style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>META CALÓRICA DIÁRIA</div>
        <div style={{ fontSize: 52, fontWeight: 900, background: T.gradAccent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{macros.kcal}</div>
        <div style={{ color: T.muted, fontSize: 14 }}>kcal/dia •
          <span style={{ color: T.text, fontWeight: 600 }}> objetivo: {perfil.objetivo === "hipertrofia" ? "Crescer o Glúteo" : perfil.objetivo === "definir" ? "Definir e Empinar" : "Emagrecer e Modelar"}</span>
        </div>
      </Card>

      {/* Macros */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Proteína", value: macros.ptn, unit: "g", cor: "#E040FB", emoji: "💪", desc: `${(macros.ptn * 4 / macros.kcal * 100).toFixed(0)}% das calorias` },
          { label: "Carboidrato", value: macros.carb, unit: "g", cor: "#64B5F6", emoji: "🍠", desc: `${(macros.carb * 4 / macros.kcal * 100).toFixed(0)}% das calorias` },
          { label: "Gordura", value: macros.fat, unit: "g", cor: "#FFB74D", emoji: "🥑", desc: `${(macros.fat * 9 / macros.kcal * 100).toFixed(0)}% das calorias` },
        ].map(m => (
          <Card key={m.label} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
            <div style={{ color: m.cor, fontSize: 26, fontWeight: 800 }}>{m.value}<span style={{ fontSize: 12 }}>{m.unit}</span></div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>{m.label}</div>
            <div style={{ color: T.dim, fontSize: 10, marginTop: 2 }}>{m.desc}</div>
          </Card>
        ))}
      </div>

      {/* Water */}
      <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        <span style={{ fontSize: 36 }}>💧</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{(perfil.peso * 0.035).toFixed(1)}L por dia</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Hidratação recomendada para seu peso</div>
          <ProgressBar pct={60} cor="#64B5F6" height={6} />
        </div>
      </Card>

      {/* Meals */}
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: 17, marginBottom: 12 }}>🍽️ Distribuição das Refeições</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {refeicoes.map((r, i) => {
            const kcalRef = Math.round(macros.kcal * r.pct / 100);
            return (
              <Card key={i} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ color: T.text, fontWeight: 600 }}>{r.nome}</span>
                    <span style={{ color: T.dim, fontSize: 13, marginLeft: 8 }}>{r.horario}</span>
                  </div>
                  <span style={{ color: T.accent, fontWeight: 700 }}>{kcalRef} kcal</span>
                </div>
                <ProgressBar pct={r.pct} cor={T.accent} height={5} />
                <div style={{ color: T.dim, fontSize: 12, marginTop: 4 }}>{r.pct}% das calorias diárias</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: 17, marginBottom: 12 }}>💡 Dicas Nutricionais</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dicas.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: T.card2, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 22 }}>{d.emoji}</span>
              <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>{d.texto}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WEEKS TAB ────────────────────────────────────────────────────────────────
function WeeksTab({ semanaAtual, setSemana }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Phases */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FASES.map((f, i) => (
          <Card key={i} style={{ borderLeft: `4px solid ${f.cor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ color: f.cor, fontWeight: 800, fontSize: 17 }}>Fase {i + 1}: {f.nome}</div>
              <Badge cor={f.cor}>Semanas {f.semanas}</Badge>
            </div>
            <div style={{ color: T.muted, fontSize: 14 }}>{f.desc}</div>
          </Card>
        ))}
      </div>

      {/* Weekly split */}
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: 17, marginBottom: 12 }}>📅 Divisão Semanal</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DIVISAO_SEMANAL.map((d, i) => {
            const isRest = d.treino === "—";
            const treino = !isRest ? TREINOS[d.treino] : null;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: T.card2, borderRadius: 12, padding: "12px 16px",
                border: `1px solid ${isRest ? T.border : treino?.cor + "44"}`,
              }}>
                <div style={{ width: 40, textAlign: "center" }}>
                  <div style={{ color: isRest ? T.dim : treino?.cor, fontWeight: 800, fontSize: 13 }}>{d.dia}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: isRest ? T.muted : T.text, fontWeight: isRest ? 400 : 600, fontSize: 15 }}>{d.foco}</div>
                </div>
                {!isRest && (
                  <Badge cor={treino?.cor}>Treino {d.treino}</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Week selector */}
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: 17, marginBottom: 12 }}>🗓️ Selecionar Semana</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(s => {
            const fase = s <= 4 ? FASES[0] : s <= 8 ? FASES[1] : FASES[2];
            return (
              <button key={s} onClick={() => setSemana(s)} style={{
                background: semanaAtual === s ? fase.cor + "33" : T.card2,
                border: `2px solid ${semanaAtual === s ? fase.cor : T.border}`,
                borderRadius: 12, padding: "12px 4px", cursor: "pointer", textAlign: "center", transition: "all .2s",
              }}>
                <div style={{ color: semanaAtual === s ? fase.cor : T.muted, fontSize: 13, fontWeight: 700 }}>S{s}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips per phase */}
      <Card style={{ background: `linear-gradient(135deg, #E040FB22, transparent)` }}>
        <div style={{ color: T.accent, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🍑 Dicas por Fase</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { fase: "Ativação (S1–4)", dica: "Foque na conexão mente-músculo. Sinta o glúteo em cada repetição antes de aumentar a carga.", emoji: "🧠" },
            { fase: "Hipertrofia (S5–8)", dica: "Aumente a carga semanalmente. Use o princípio da sobrecarga progressiva para máximo crescimento.", emoji: "📈" },
            { fase: "Intensidade (S9–12)", dica: "Implemente drop sets, supersets e peak contraction de 2 segundos para finalizar o ciclo forte.", emoji: "🔥" },
          ].map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: T.bg, borderRadius: 10 }}>
              <span style={{ fontSize: 24 }}>{d.emoji}</span>
              <div>
                <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{d.fase}</div>
                <div style={{ color: T.muted, fontSize: 13, marginTop: 3, lineHeight: 1.4 }}>{d.dica}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({ user, perfil, onLogout }) {
  const [tab, setTab] = useState("treino");
  const [semana, setSemana] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "treino", label: "Treino", emoji: "🏋️" },
    { id: "nutricao", label: "Nutrição", emoji: "🥗" },
    { id: "semanas", label: "Plano", emoji: "📅" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28, animation: "heartbeat 3s infinite" }}>🍑</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, background: T.gradAccent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GluteoMax</div>
              <div style={{ color: T.muted, fontSize: 11 }}>Semana {semana} • {semana <= 4 ? "Ativação" : semana <= 8 ? "Hipertrofia" : "Intensidade"}</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 12px", cursor: "pointer", fontSize: 20 }}>
              👤
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: "110%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 8, minWidth: 180, boxShadow: T.shadow, zIndex: 200, animation: "fadeIn .2s ease" }}>
                <div style={{ padding: "8px 12px 12px", borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>
                  <div style={{ color: T.muted, fontSize: 11 }}>Logado como</div>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{user?.email}</div>
                </div>
                <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", color: "#EF9A9A", cursor: "pointer", textAlign: "left", fontSize: 14, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          {tab === "treino" && <WorkoutTab semana={semana} perfil={perfil} />}
          {tab === "nutricao" && <NutritionTab perfil={perfil} />}
          {tab === "semanas" && <WeeksTab semanaAtual={semana} setSemana={s => { setSemana(s); setTab("treino"); }} />}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.bg2, borderTop: `1px solid ${T.border}`, padding: "10px 16px 16px", zIndex: 100 }}>
        <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .2s",
            }}>
              <div style={{
                fontSize: 24,
                filter: tab === t.id ? "none" : "grayscale(1) opacity(.5)",
                transform: tab === t.id ? "scale(1.2)" : "scale(1)",
                transition: "all .2s",
              }}>{t.emoji}</div>
              <span style={{ fontSize: 11, color: tab === t.id ? T.accent : T.dim, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: 99, background: T.accent }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPerfil = localStorage.getItem("gluteomax_perfil");
    if (savedPerfil) setPerfil(JSON.parse(savedPerfil));

    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = (data) => {
    localStorage.setItem("gluteomax_perfil", JSON.stringify(data));
    setPerfil(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("gluteomax_perfil");
    setPerfil(null);
    setUser(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 56, animation: "heartbeat 1.5s infinite" }}>🍑</div>
      <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;
  if (!perfil) return <Onboarding onComplete={handleOnboardingComplete} />;
  return <MainApp user={user} perfil={perfil} onLogout={handleLogout} />;
}
