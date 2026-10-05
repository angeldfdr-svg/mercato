import { useState } from "react";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível atualizar a password");
      toast.success("Password atualizada."); navigate("/"); window.location.reload();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a password"); } finally { setPending(false); }
  };
  return <div className="auth-page"><div className="auth-card"><Link href="/" className="auth-brand"><span className="brand-mark">M<span>/</span></span><strong>mercato</strong></Link><div className="auth-card-heading"><p className="section-kicker">Recuperação segura</p><h1>Escolha uma nova password.</h1><p>Use pelo menos 8 caracteres. O link expira automaticamente após 30 minutos.</p></div><form onSubmit={submit} className="auth-form"><label><span>Nova password</span><div className="auth-input"><KeyRound size={16} /><input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" /></div></label><Button disabled={pending || !token} className="auth-submit">{pending ? "A guardar..." : "Guardar nova password"}<ArrowRight size={16} /></Button></form><div className="auth-security"><ShieldCheck size={15} /> Este link é de utilização única.</div><Link href="/login" className="auth-back-link">Voltar ao login</Link></div></div>;
}
