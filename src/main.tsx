import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./store";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);

// Service Worker nur im Produktions-Build und nur als eigenständige Seite (nicht eingebettet)
if (import.meta.env.PROD && "serviceWorker" in navigator && window.top === window) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Offline-Modus nicht verfügbar – App funktioniert trotzdem
    });
  });
}
