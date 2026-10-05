import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MarketplaceShell } from "./components/MarketplaceShell";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Account = lazy(() => import("./pages/Account"));
const Cart = lazy(() => import("./pages/Cart"));
const SellerInbox = lazy(() => import("./pages/SellerInbox"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function PageLoading() {
  return (
    <div
      className="mx-auto max-w-[1440px] px-5 py-20 text-sm text-[#536178]"
      role="status"
      aria-live="polite"
    >
      A carregar a página…
    </div>
  );
}

function Router() {
  return (
    <MarketplaceShell>
      <Suspense fallback={<PageLoading />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/account" component={Account} />
          <Route path="/cart" component={Cart} />
          <Route path="/seller/inbox" component={SellerInbox} />
          <Route path="/login" component={AuthPage} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </MarketplaceShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
