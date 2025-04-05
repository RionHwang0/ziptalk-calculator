import { Route, Router, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Home from "./pages/Home";
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
            <Route path="/calculator" component={Home} />
            <Route path="/" component={Home} />
          </Switch>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
