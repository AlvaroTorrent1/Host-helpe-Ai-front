import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initMediaService } from "./services/mediaService";
import { setupPerformanceMonitoring } from "./utils/performanceMonitoring";

// ✅ OPTIMIZACIÓN: Inicializar monitoreo de performance (Web Vitals)
// Trackea LCP, FID, CLS, FCP, TTFB para medir velocidad real
setupPerformanceMonitoring();

// Initialize media service to ensure storage bucket exists
initMediaService().catch(error => {
  console.error("Failed to initialize media service:", error);
  // Continue app initialization even if bucket creation fails
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
