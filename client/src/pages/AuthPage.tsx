import { useEffect, useState } from "react";
import {
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

async function postAuth(path: string, payload: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error ?? "Não foi possível concluir a operação");
  return data;
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { credentials: "same-origin" })
      .then(response => {
        if (!response.ok) throw new Error("Provider status unavailable");
        return response.json();
      })
      .then(data => {
        if (active) {
          setEmailAvailable(data.email === true);
          setRecoveryAvailable(data.passwordRecovery === true);
        }
      })
      .catch(() => {
        if (active) {
          setEmailAvailable(false);
          setRecoveryAvailable(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const canSubmit =
    emailAvailable === true && (mode !== "recover" || recoveryAvailable);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      if (mode === "recover") {
        await postAuth("/api/auth/request-password-reset", {
          email: form.email,
        });
        toast.success("Se a conta existir, receberá instruções por email.");
        return;
      }
      await postAuth(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        form
      );
      toast.success(mode === "login" ? "Sessão iniciada." : "Conta criada.");
      navigate("/");
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação"
      );
    } finally {
      setPending(false);
    }
  };

  const title =
    mode === "recover"
      ? "Recupere o seu acesso."
      : mode === "register"
        ? "Comece a sua seleção."
        : "Entre no seu Mercato.";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">
            M<span>/</span>
          </span>
          <strong>mercato</strong>
        </Link>
        <div className="auth-card-heading">
          <p className="section-kicker">Conta Mercato</p>
          <h1>{title}</h1>
          <p>
            {mode === "recover"
              ? "Se a conta existir, receberá um link seguro para definir uma nova password."
              : "Entre ou crie uma conta para acompanhar as suas compras."}
          </p>
        </div>
        {emailAvailable === null && (
          <p className="auth-provider-note" role="status">
            A verificar a disponibilidade da conta…
          </p>
        )}
        {emailAvailable === false && (
          <p className="auth-provider-message" role="alert">
            O acesso por email está temporariamente indisponível. Tente mais
            tarde.
          </p>
        )}
        {mode === "recover" &&
          emailAvailable === true &&
          !recoveryAvailable && (
            <p className="auth-provider-message" role="alert">
              A recuperação de password por email está temporariamente
              indisponível.
            </p>
          )}
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label>
              <span>Nome</span>
              <div className="auth-input">
                <UserRound size={16} aria-hidden="true" />
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="O seu nome"
                />
              </div>
            </label>
          )}
          <label>
            <span>Email</span>
            <div className="auth-input">
              <Mail size={16} aria-hidden="true" />
              <input
                required
                maxLength={254}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={event =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="nome@email.com"
              />
            </div>
          </label>
          {mode !== "recover" && (
            <label>
              <span>Password</span>
              <div className="auth-input">
                <KeyRound size={16} aria-hidden="true" />
                <input
                  required
                  minLength={mode === "register" ? 12 : 8}
                  maxLength={128}
                  type="password"
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  value={form.password}
                  onChange={event =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder={
                    mode === "register"
                      ? "Mínimo 12 caracteres"
                      : "A sua password"
                  }
                />
              </div>
            </label>
          )}
          <Button disabled={pending || !canSubmit} className="auth-submit">
            {pending
              ? "A processar..."
              : mode === "recover"
                ? "Enviar link de recuperação"
                : mode === "register"
                  ? "Criar conta"
                  : "Iniciar sessão"}
            <ArrowRight size={16} />
          </Button>
        </form>
        <div className="auth-links">
          {mode === "login" && (
            <button type="button" onClick={() => setMode("recover")}>
              Esqueci-me da password
            </button>
          )}
          {mode === "recover" && (
            <button type="button" onClick={() => setMode("login")}>
              Voltar ao login
            </button>
          )}
          {mode !== "recover" && (
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login"
                ? "Ainda não tem conta? Criar agora"
                : "Já tem conta? Iniciar sessão"}
            </button>
          )}
        </div>
        <div className="auth-security">
          <ShieldCheck size={15} aria-hidden="true" /> Dados protegidos; nunca
          guardamos dados de cartão.
        </div>
      </div>
    </div>
  );
}
