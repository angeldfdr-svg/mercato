import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpDown, Search, X } from "lucide-react";
import { categoryMeta, products, type Category } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const categories: Array<"Todos" | Category> = [
  "Todos",
  ...categoryMeta.map(category => category.label),
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
  const categoryParam = params.get("category") ?? "Todos";
  const initialCategory = categories.includes(categoryParam as Category | "Todos")
    ? (categoryParam as Category | "Todos")
    : "Todos";
  const [selectedCategory, setSelectedCategory] = useState<"Todos" | Category>(initialCategory);
  const category = selectedCategory;

  useEffect(() => {
    const nextParams = new URLSearchParams(location.split("?")[1] ?? "");
    const nextCategory = nextParams.get("category") ?? "Todos";
    setSelectedCategory(
      categories.includes(nextCategory as Category | "Todos")
        ? (nextCategory as Category | "Todos")
        : "Todos"
    );
  }, [location]);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeSearch(query);
    const result = products.filter(product => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const haystack = normalizeSearch(
        `${product.name} ${product.category} ${product.subcategory} ${product.description}`
      );
      return matchesCategory && haystack.includes(normalizedSearch);
    });
    if (sort === "price-low") {
      return [...result].sort((a, b) => a.price - b.price);
    }
    if (sort === "price-high") {
      return [...result].sort((a, b) => b.price - a.price);
    }
    if (sort === "rating") {
      return [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [category, query, sort]);

  const chooseCategory = (next: "Todos" | Category) => {
    setSelectedCategory(next);
    const nextParams = new URLSearchParams();
    if (next !== "Todos") nextParams.set("category", next);
    if (query) nextParams.set("query", query);
    navigate(nextParams.size ? `/shop?${nextParams.toString()}` : "/shop");
  };

  const clearSearch = () => {
    const nextParams = new URLSearchParams(params);
    nextParams.delete("query");
    navigate(nextParams.size ? `/shop?${nextParams.toString()}` : "/shop");
  };

  const clearFilters = () => {
    setSelectedCategory("Todos");
    navigate(query ? `/shop?query=${encodeURIComponent(query)}` : "/shop");
  };

  const hasActiveFilters = category !== "Todos" || Boolean(query);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16">
      <div className="shop-header">
        <div>
          <p className="section-kicker">
            A loja Mercato · {products.length} peças · {categoryMeta.length}{" "}
            categorias
          </p>
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
        <div className="category-pills" aria-label="Filtrar por categoria">
          {categories.map(item => (
            <button
              key={item}
              onClick={() => chooseCategory(item)}
              aria-pressed={category === item}
              className={
                category === item ? "category-pill-active" : "category-pill"
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
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
          {query && (
            <>
              {" "}
              para <strong className="text-[#10203a]">“{query}”</strong>
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button className="text-link" onClick={clearFilters}>
            Limpar filtros <X size={14} />
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
            onClick={() => navigate("/shop")}
          >
            Ver tudo
          </Button>
        </div>
      )}
    </div>
  );
}
