import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { MarketplaceShell } from "./components/MarketplaceShell";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import SellerInbox from "./pages/SellerInbox";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";

function Router() {
  return <MarketplaceShell><Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/product/:slug" component={Product} /><Route path="/account" component={Account} /><Route path="/cart" component={Cart} /><Route path="/favorites" component={Favorites} /><Route path="/seller/inbox" component={SellerInbox} /><Route path="/login" component={AuthPage} /><Route path="/reset-password" component={ResetPassword} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></MarketplaceShell>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><FavoritesProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></FavoritesProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
