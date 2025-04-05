import { Route, Router, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Calculator from "./pages/Calculator";
import Header from "./components/Header";
import "./index.css";

const queryClient = new QueryClient();

const App = () => {
  const [location, setLocation] = useLocation();
  const base = "/ziptalk-calculator";

  useEffect(() => {
    if (location === "/") {
      setLocation(base + "/calculator");
    }
  }, [location, setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router base={base}>
        <div className="app">
          <Header />
          <Switch>
            <Route path="/calculator" component={Calculator} />
            <Route path="/" component={Calculator} />
          </Switch>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
