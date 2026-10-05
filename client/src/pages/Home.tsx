import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import {
  categoryMeta,
  featuredProducts,
  formatPrice,
  getProductImageSrcSet,
  products,
} from "@/data/catalog";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <section className="hero-section mx-auto max-w-[1440px] px-5 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-12">
        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="eyebrow">
              <span className="eyebrow-dot" /> Curadoria de outubro{" "}
              <ArrowUpRight size={14} />
            </div>
            <h1 className="hero-title">
              Encontre
              <br />
              <em>o que fica.</em>
            </h1>
            <p className="hero-subtitle">
              Objetos com intenção, marcas com história e pequenas descobertas
              para todos os dias.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="rounded-full bg-[#155eef] px-6 py-6 text-[15px] hover:bg-[#0e4ac7]"
              >
                <Link href="/shop">
                  Explorar a curadoria <ArrowRight size={17} />
                </Link>
              </Button>
              <Link href="/shop" className="text-link">
                Ver toda a seleção <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="avatar-stack">
                <span>AM</span>
                <span>FC</span>
                <span>LR</span>
              </span>
              <span>
                <strong>+2.400 pessoas</strong> encontraram um favorito esta
                semana.
              </span>
            </div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          >
            <img
              src="/products/arc-lounge-chair.webp"
              srcSet={getProductImageSrcSet("/products/arc-lounge-chair.webp")}
              sizes="(max-width: 900px) 100vw, 55vw"
              alt="Poltrona Arc em azul-cobalto com estrutura de carvalho"
              fetchPriority="high"
              decoding="async"
            />
            <div className="hero-float-card">
              <span className="float-card-label">Peça em foco</span>
              <strong>Poltrona Arc</strong>
              <span className="flex items-center gap-1 text-xs text-[#536178]">
                Casa <span className="text-[#b3bdc9]">·</span>{" "}
                {formatPrice(449)}
              </span>
              <Link
                href="/product/arc-lounge-chair"
                className="float-card-link"
              >
                Ver peça <ArrowUpRight size={14} />
              </Link>
            </div>
            <span className="hero-stamp">
              M/26
              <br />
              <small>EDIT</small>
            </span>
          </motion.div>
        </div>
        <div className="trust-row">
          <div>
            <Truck size={18} />
            <span>
              <strong>Entrega gratuita</strong>
              <small>Em compras acima de 120€</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>
              <strong>Escolhas seguras</strong>
              <small>Pagamento protegido</small>
            </span>
          </div>
          <div>
            <Leaf size={18} />
            <span>
              <strong>Curadoria consciente</strong>
              <small>Menos, mas melhor</small>
            </span>
          </div>
          <div>
            <Clock3 size={18} />
            <span>
              <strong>Trocas simples</strong>
              <small>30 dias para decidir</small>
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-16">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Escolha o seu ritmo</p>
            <h2 className="section-title">Comece por aqui.</h2>
          </div>
          <Link href="/shop" className="text-link">
            Ver todas <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="category-grid">
          {categoryMeta.map((category, index) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.38,
                delay: Math.min(index * 0.035, 0.25),
              }}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(category.label)}`}
                className="category-card group"
              >
                <div
                  className={`category-art bg-gradient-to-br ${category.tone}`}
                >
                  <span className="category-symbol">{category.symbol}</span>
                  <span className="category-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-[21px] font-bold tracking-[-0.04em]">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-sm text-[#7b8799]">
                      {category.note}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[#155eef]">
                      {
                        products.filter(
                          product => product.category === category.label
                        ).length
                      }{" "}
                      peças
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#155eef]">
                    Explorar
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-20">
        <div className="section-heading">
          <div>
            <p className="section-kicker">A seleção que pede atenção</p>
            <h2 className="section-title">Em destaque.</h2>
          </div>
          <Link href="/shop" className="text-link">
            Ver catálogo completo <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-16">
        <div className="editorial-panel">
          <div>
            <p className="section-kicker text-[#d7f64a]">A ideia por trás</p>
            <h2 className="editorial-title">
              Comprar menos.
              <br />
              <span>Escolher melhor.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#c5cfdf]">
              O Mercato junta marcas independentes e objetos que sobrevivem à
              tendência. Uma seleção pequena, editada com cuidado, para uma vida
              com mais espaço.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-[#d7f64a] decoration-2 underline-offset-8"
            >
              Conheça a curadoria <ArrowRight size={16} />
            </Link>
          </div>
          <div className="editorial-list">
            <div>
              <span>01</span>
              <p>
                <strong>Descobrir</strong>
                <small>Uma seleção fora do ruído.</small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Escolher</strong>
                <small>Detalhes que fazem diferença.</small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>Ficar</strong>
                <small>Peças para usar e repetir.</small>
              </p>
            </div>
          </div>
        </div>
      </section>
      <motion.section
        className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 text-center lg:px-10"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="newsletter-panel">
          <Sparkles className="mx-auto mb-4 text-[#155eef]" size={22} />
          <p className="section-kicker justify-center">
            Uma seleção, {products.length} descobertas
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.05em] md:text-4xl">
            Há sempre algo por descobrir.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#536178]">
            De casa ao desporto, explore {products.length} peças escolhidas para
            durar — com pesquisa, filtros por categoria e ordenação por preço ou
            avaliação.
          </p>
          <Button asChild className="mt-6 rounded-full bg-[#155eef] px-6">
            <Link href="/shop">
              Explorar os {products.length} produtos <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
