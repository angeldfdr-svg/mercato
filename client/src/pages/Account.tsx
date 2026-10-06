import {
  ArrowRight,
  CheckCircle2,
  Camera,
  CreditCard,
  Edit3,
  LogOut,
  MapPin,
  Package,
  Save,
  Store,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLocalLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type UserWithProfile = {
  phone?: string;
  avatarUrl?: string;
};

function formatOrderAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function Account() {
  const { user, isAuthenticated, loading, logout, refresh } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const orders = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone((user as UserWithProfile).phone ?? "");
    setAvatarUrl((user as UserWithProfile).avatarUrl ?? "");
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, phone, avatarUrl }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível guardar o perfil");
      await refresh();
      setEditingProfile(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Não foi possível guardar o perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const chooseAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      setProfileError("Escolha uma imagem até 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };
  if (loading)
    return (
      <div className="account-page">
        <div className="loading-pulse" />
        <div className="loading-pulse short" />
        <div className="loading-card" />
      </div>
    );
  if (!isAuthenticated)
    return (
      <div className="account-page">
        <div className="account-login-card">
          <div className="account-icon">
            <UserRound size={22} />
          </div>
          <p className="section-kicker">Área pessoal</p>
          <h1 className="page-title mt-3">
            As suas escolhas,
            <br />
            <em>num só lugar.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-[15px] leading-7 text-[#536178]">
            Inicie sessão para consultar as suas encomendas e gerir o seu perfil
            Mercato.
          </p>
          <Button
            className="mt-8 rounded-full bg-[#155eef] px-7 py-6"
            onClick={startLocalLogin}
          >
            Iniciar sessão <ArrowRight size={17} />
          </Button>
          <p className="mt-4 text-xs text-[#7b8799]">
            A conta usa email e password. A disponibilidade depende dos serviços
            ligados a esta loja.
          </p>
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-12 lg:pt-20">
      <div className="flex flex-col justify-between gap-6 border-b border-[#10203a]/10 pb-10 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">A minha conta</p>
          <h1 className="page-title mt-3">
            Olá, <em>{user?.name?.split(" ")[0] ?? "por aqui"}.</em>
          </h1>
          <p className="mt-3 text-[15px] text-[#536178]">
            Tudo o que precisa, guardado e simples.
          </p>
        </div>
        <button
          className="text-link self-start sm:self-auto"
          onClick={() => void logout()}
        >
          Terminar sessão <LogOut size={15} />
        </button>
      </div>
      <div className="account-grid">
        <div className="account-card">
          <div className="account-card-icon">
            <Package size={20} />
          </div>
          <p className="section-kicker">Encomendas</p>
          <h2>Histórico de compras</h2>
          <p>
            {orders.data?.length
              ? `${orders.data.length} encomenda${orders.data.length > 1 ? "s" : ""} registada${orders.data.length > 1 ? "s" : ""}.`
              : "As suas encomendas vão aparecer aqui assim que a primeira descoberta chegar."}
          </p>
          <a className="account-card-link" href="#orders">
            Ver encomendas <ArrowRight size={15} />
          </a>
        </div>
        <div className="account-card">
          <div className="account-card-icon">
            <MapPin size={20} />
          </div>
          <p className="section-kicker">Moradas</p>
          <h2>Entrega sem esforço</h2>
          <p>
            As moradas são pedidas no checkout seguro, no momento da compra.
          </p>
        </div>
        <div className="account-card account-card-wide">
          {!editingProfile ? (
            <>
              <div>
                <p className="section-kicker">O seu perfil</p>
                <h2>{user?.name ?? "Cliente Mercato"}</h2>
                <p>{user?.email ?? "Email não disponível"}</p>
                {(user as UserWithProfile)?.phone && <p>{(user as UserWithProfile).phone}</p>}
                <button type="button" className="text-link mt-5" onClick={() => setEditingProfile(true)}>
                  Editar perfil <Edit3 size={15} />
                </button>
              </div>
              {(user as UserWithProfile)?.avatarUrl ? (
                <img className="profile-avatar object-cover" src={(user as UserWithProfile).avatarUrl} alt="Fotografia do perfil" />
              ) : (
                <div className="profile-avatar">{(user?.name ?? "M").slice(0, 1).toUpperCase()}</div>
              )}
            </>
          ) : (
            <form className="w-full text-left" onSubmit={saveProfile}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Editar perfil</p>
                  <h2>Os seus dados.</h2>
                </div>
                <label className="profile-avatar profile-upload cursor-pointer" aria-label="Escolher fotografia de perfil">
                  {avatarUrl ? <img className="h-full w-full rounded-full object-cover" src={avatarUrl} alt="Pré-visualização da fotografia" /> : <Camera size={22} />}
                  <input className="sr-only" type="file" accept="image/*" onChange={chooseAvatar} />
                </label>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="auth-form-field"><span>Nome</span><input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={100} required /></label>
                <label className="auth-form-field"><span>Telemóvel</span><input value={phone} onChange={event => setPhone(event.target.value)} maxLength={30} placeholder="+351 900 000 000" /></label>
              </div>
              {profileError && <p className="auth-provider-message mt-4" role="alert">{profileError}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="submit" disabled={savingProfile} className="rounded-full bg-[#155eef]">{savingProfile ? "A guardar..." : "Guardar perfil"} <Save size={16} /></Button>
                <button type="button" className="text-link" onClick={() => { setEditingProfile(false); setProfileError(""); }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>
      {user?.role === "admin" && (
        <Link href="/seller/inbox" className="seller-inbox-link">
          <span>
            <Store size={17} />
            <strong>Inbox de vendedores</strong>
            <small>Responder às conversas em tempo real</small>
          </span>
          <ArrowRight size={17} />
        </Link>
      )}
      <section className="orders-section" id="orders">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Pagamentos</p>
            <h2 className="section-title">As suas encomendas.</h2>
          </div>
          <div className="orders-security">
            <CreditCard size={15} /> Stripe Checkout
          </div>
        </div>
        {orders.isLoading ? (
          <div className="orders-skeleton" />
        ) : orders.data?.length ? (
          <div className="orders-list">
            {orders.data.map(order => (
              <div className="order-row" key={order.id}>
                <div className="order-status">
                  <CheckCircle2 size={17} />
                  <span>
                    <strong>Pago</strong>
                    <small>
                      {new Intl.DateTimeFormat("pt-PT", {
                        dateStyle: "medium",
                      }).format(new Date(order.createdAt))}
                    </small>
                  </span>
                </div>
                <span className="order-id">
                  #{order.stripeCheckoutSessionId.slice(-8)}
                </span>
                <strong className="font-display">
                  {formatOrderAmount(order.amountCents, order.currency)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="orders-empty">
            <CreditCard size={20} />
            <span>
              Ainda não há pagamentos confirmados. O primeiro checkout aparecerá
              aqui após o webhook Stripe.
            </span>
          </div>
        )}
      </section>
      <div className="account-footnote">
        <span>Precisa de ajuda?</span>
        <Link href="/shop" className="text-link">
          Voltar à loja <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
