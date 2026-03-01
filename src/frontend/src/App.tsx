import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";

// ── Layout component ───────────────────────────────────────────
function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border border-border/60 text-foreground shadow-card font-body",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-secondary text-secondary-foreground",
            error: "border-destructive/30 bg-destructive/5",
            success: "border-green-500/30 bg-green-500/5",
          },
        }}
      />
    </div>
  );
}

// ── Route definitions ──────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$id",
  component: ResultsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

// ── Router ─────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  sessionRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
