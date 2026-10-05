import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowDown,
  ArrowUpDown,
  Check,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categoryMeta, products, type Category } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const category = categories.includes(categoryParam as Category | "Todos")
    ? (categoryParam as Category | "Todos")
    : "Todos";
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minimumRating, setMinimumRating] = useState("0");
  const [visibleCount, setVisibleCount] = useState(24);
  const colorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap(product =>
            product.variants.length ? product.variants : [product.color]
          )
        )
      ).sort((a, b) => a.localeCompare(b, "pt-PT")),
    []
  );
  const validPriceRange =
    minimumPrice === "" ||
    maximumPrice === "" ||
    Number(minimumPrice) <= Number(maximumPrice);
  const activeFilterCount =
    Number(minimumPrice !== "" || maximumPrice !== "") +
    Number(selectedColors.length > 0) +
    Number(minimumRating !== "0");

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeSearch(query);
    const result = products.filter(product => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const haystack = normalizeSearch(
        `${product.name} ${product.category} ${product.subcategory} ${product.description}`
      );
      const matchesPrice =
        validPriceRange &&
        (minimumPrice === "" || product.price >= Number(minimumPrice)) &&
        (maximumPrice === "" || product.price <= Number(maximumPrice));
      const matchesColor =
        selectedColors.length === 0 ||
        [product.color, ...product.variants].some(color =>
          selectedColors.includes(color)
        );
      const matchesRating = product.rating >= Number(minimumRating);
      return (
        matchesCategory &&
        matchesPrice &&
        matchesColor &&
        matchesRating &&
        haystack.includes(normalizedSearch)
      );
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
  }, [
    category,
    maximumPrice,
    minimumPrice,
    minimumRating,
    query,
    selectedColors,
    sort,
    validPriceRange,
  ]);

  useEffect(() => {
    setVisibleCount(24);
  }, [
    category,
    maximumPrice,
    minimumPrice,
    minimumRating,
    query,
    selectedColors,
    sort,
  ]);

  const visibleProducts = filtered.slice(0, visibleCount);

  const chooseCategory = (next: "Todos" | Category) => {
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

  const toggleColor = (color: string, checked: boolean) => {
    setSelectedColors(current =>
      checked
        ? [...current, color]
        : current.filter(selected => selected !== color)
    );
  };

  const clearFilters = () => {
    setMinimumPrice("");
    setMaximumPrice("");
    setSelectedColors([]);
    setMinimumRating("0");
    chooseCategory("Todos");
  };

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
        <div
          className="category-pills"
          role="group"
          aria-label="Filtrar por categoria"
        >
          {categories.map(item => (
            <button
              type="button"
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
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="toolbar-button"
                aria-label={
                  activeFilterCount > 0
                    ? `Abrir filtros, ${activeFilterCount} ativos`
                    : "Abrir filtros"
                }
              >
                <SlidersHorizontal size={15} /> Filtros
                {activeFilterCount > 0 && (
                  <span className="filter-count" aria-hidden="true">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent
              className="catalog-filter-dialog max-h-[85vh] overflow-y-auto sm:max-w-2xl"
              showCloseButton={false}
            >
              <DialogHeader className="catalog-filter-header">
                <div>
                  <p className="section-kicker">Afine a pesquisa</p>
                  <DialogTitle className="font-display text-2xl font-bold">
                    Filtros
                  </DialogTitle>
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Fechar filtros"
                  >
                    <X size={18} />
                  </button>
                </DialogClose>
              </DialogHeader>
              <DialogDescription className="catalog-filter-description">
                Combine preço, cor, avaliação e categoria para encontrar a peça
                certa.
              </DialogDescription>
              <div className="catalog-filter-controls">
                <fieldset className="filter-fieldset">
                  <legend>Preço (€)</legend>
                  <div className="filter-price-row">
                    <label className="filter-field">
                      <span>Mínimo</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={minimumPrice}
                        onChange={event => setMinimumPrice(event.target.value)}
                        aria-label="Preço mínimo em euros"
                        aria-invalid={!validPriceRange}
                        aria-describedby={
                          validPriceRange ? undefined : "price-range-error"
                        }
                        placeholder="0"
                      />
                    </label>
                    <label className="filter-field">
                      <span>Máximo</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={maximumPrice}
                        onChange={event => setMaximumPrice(event.target.value)}
                        aria-label="Preço máximo em euros"
                        aria-invalid={!validPriceRange}
                        aria-describedby={
                          validPriceRange ? undefined : "price-range-error"
                        }
                        placeholder="Sem limite"
                      />
                    </label>
                  </div>
                  {!validPriceRange && (
                    <p
                      id="price-range-error"
                      className="filter-error"
                      role="alert"
                    >
                      O preço mínimo não pode ser superior ao máximo.
                    </p>
                  )}
                </fieldset>
                <label className="filter-field filter-rating-field">
                  <span>Avaliação mínima</span>
                  <select
                    value={minimumRating}
                    onChange={event => setMinimumRating(event.target.value)}
                    aria-label="Avaliação mínima"
                  >
                    <option value="0">Todas as avaliações</option>
                    <option value="4">4 estrelas ou mais</option>
                    <option value="4.5">4,5 estrelas ou mais</option>
                    <option value="4.8">4,8 estrelas ou mais</option>
                  </select>
                </label>
              </div>
              <fieldset className="filter-fieldset filter-colors-fieldset">
                <legend>Cor</legend>
                <div className="filter-color-options">
                  {colorOptions.map(color => {
                    const checked = selectedColors.includes(color);
                    return (
                      <label className="filter-color-option" key={color}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={event =>
                            toggleColor(color, event.target.checked)
                          }
                        />
                        <span className="filter-checkbox" aria-hidden="true">
                          {checked && <Check size={12} />}
                        </span>
                        <span>{color}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="filter-category-section">
                <p className="filter-legend">Categoria</p>
                <div
                  className="filter-category-options"
                  role="group"
                  aria-label="Filtrar por categoria"
                >
                  {categories.map(item => (
                    <button
                      type="button"
                      key={item}
                      className={
                        category === item
                          ? "category-pill-active"
                          : "category-pill"
                      }
                      aria-pressed={category === item}
                      onClick={() => chooseCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="catalog-filter-footer">
                <button
                  type="button"
                  className="filter-reset-button"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    disabled={!validPriceRange}
                    className="rounded-full bg-[#155eef] px-6"
                  >
                    Ver {filtered.length} resultados
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <label className="sort-select">
            <ArrowUpDown size={14} aria-hidden="true" />
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
        <p className="text-sm text-[#7b8799]" role="status" aria-live="polite">
          <strong className="text-[#10203a]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
          {query && (
            <>
              {" "}
              para <strong className="text-[#10203a]">“{query}”</strong>
            </>
          )}
        </p>
        {query && (
          <button className="text-link" onClick={clearSearch}>
            Limpar pesquisa <X size={14} />
          </button>
        )}
      </div>
      {filtered.length > 0 ? (
        <>
          <div className="product-grid">
            {visibleProducts.map(product => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
          {visibleProducts.length < filtered.length && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-xs text-[#7b8799]">
                A mostrar {visibleProducts.length} de {filtered.length} produtos
              </p>
              <Button
                className="rounded-full border border-[#10203a]/15 bg-transparent px-6 text-[#10203a] hover:bg-[#f0efe9]"
                onClick={() => setVisibleCount(count => count + 24)}
              >
                Mostrar mais{" "}
                {Math.min(24, filtered.length - visibleProducts.length)}
                <ArrowDown size={15} />
              </Button>
            </div>
          )}
        </>
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
