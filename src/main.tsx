import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "../src/components/theme-provider";
import { AppProvider } from "./context/AppContext";
import { ClerkProvider } from "@clerk/clerk-react";

import { Toaster } from "sonner";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <AppProvider>
            <Toaster richColors position="bottom-right" />
            <App />
          </AppProvider>
        </ClerkProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
