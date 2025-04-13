import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Requirements from "@/pages/requirements";
import PurchaseOrders from "@/pages/purchase-orders";
import Reception from "@/pages/reception";
import Inventory from "@/pages/inventory";
import Outputs from "@/pages/outputs";
import Suppliers from "@/pages/suppliers";
import Accounting from "@/pages/accounting";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/requirements" component={Requirements} />
        <Route path="/purchase-orders" component={PurchaseOrders} />
        <Route path="/reception" component={Reception} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/outputs" component={Outputs} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/accounting" component={Accounting} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
