import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Filter,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";
import { products, type Category } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const categories: Array<"Todos" | Category> = [
  "Todos",
  "Casa",
  "Tech",
  "Estilo",
  "Bem-estar",
];
const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Shop() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const query = params.get("query") ?? "";
  const categoryParam = (params.get("category") as Category | null) ?? "Todos";
  const [category, setCategory] = useState<"Todos" | Category>(
    categories.includes(categoryParam) ? categoryParam : "Todos"
  );
  const [sort, setSort] = useState("featured");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [search, setSearch] = useState(query);

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);
    const result = products.filter(product => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const haystack = normalizeSearch(
        `${product.name} ${product.category} ${product.subcategory} ${product.description}`
      );
      return matchesCategory && haystack.includes(normalizedSearch);
    });
    if (sort === "price-low")
      return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high")
      return [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating")
      return [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, search, sort]);

  const chooseCategory = (next: typeof category) => {
    setCategory(next);
    navigate(next === "Todos" ? "/shop" : `/shop?category=${next}`);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16">
      <div className="shop-header">
        <div>
          <p className="section-kicker">A loja Mercato</p>
          <h1 className="page-title">
            Tudo o que
            <br />
            <em>vale ficar.</em>
          </h1>
        </div>
        <p className="max-w-sm text-[15px] leading-7 text-[#536178]">
          Uma seleção de objetos honestos, design durável e detalhes que tornam
          os dias mais interessantes.
        </p>
      </div>
      <div className="catalog-toolbar">
        <div className="category-pills">
          {categories.map(item => (
            <button
              key={item}
              onClick={() => chooseCategory(item)}
              className={
                category === item ? "category-pill-active" : "category-pill"
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button
            className="toolbar-button lg:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal size={15} /> Filtros
          </button>
          <label className="sort-select">
            <ArrowUpDown size={14} />
            <select
              value={sort}
              onChange={event => setSort(event.target.value)}
              aria-label="Ordenar produtos"
            >
              <option value="featured">Em destaque</option>
              <option value="rating">Mais avaliados</option>
              <option value="price-low">Preço mais baixo</option>
              <option value="price-high">Preço mais alto</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mb-7 flex items-center justify-between">
        <p className="text-sm text-[#7b8799]">
          <strong className="text-[#10203a]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
          {search && (
            <>
              {" "}
              para <strong className="text-[#10203a]">“{search}”</strong>
            </>
          )}
        </p>
        {search && (
          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              navigate("/shop");
            }}
          >
            Limpar pesquisa <X size={14} />
          </button>
        )}
      </div>
      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map(product => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={27} className="mx-auto mb-4 text-[#155eef]" />
          <h2 className="font-display text-2xl font-bold">
            Não encontrámos essa peça.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#536178]">
            Tente outra palavra ou explore a seleção completa para encontrar
            algo inesperado.
          </p>
          <Button
            className="mt-6 rounded-full bg-[#155eef]"
            onClick={() => {
              setSearch("");
              setCategory("Todos");
              navigate("/shop");
            }}
          >
            Ver tudo
          </Button>
        </div>
      )}
      {mobileFilters && (
        <div
          className="fixed inset-0 z-40 bg-[#10203a]/30 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-[#f8f7f3] p-6"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                Filtrar por categoria
              </h2>
              <button
                className="icon-button"
                onClick={() => setMobileFilters(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(item => (
                <button
                  key={item}
                  className={
                    category === item
                      ? "category-pill-active py-3"
                      : "category-pill py-3"
                  }
                  onClick={() => {
                    chooseCategory(item);
                    setMobileFilters(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
