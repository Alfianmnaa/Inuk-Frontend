import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

// Import the service worker registration function
// This is a "virtual module" created by vite-plugin-pwa
// It doesn't exist as a real file - it's generated during build
import { registerSW } from "virtual:pwa-register";

// Register the service worker
// This is what makes your app work offline and enables installation
// We don't need to store the return value unless we want to manually trigger updates
registerSW({
  // When a new version of the service worker is waiting to activate
  onNeedRefresh() {
    console.log("New version available! Please refresh to update.");
    
    // In production, you could show a toast notification here:
    // toast.info("New version available! Refresh to update.", {
    //   duration: 5000,
    //   action: {
    //     label: "Refresh",
    //     onClick: () => window.location.reload()
    //   }
    // });
  },
  
  // When the app is ready to work offline
  onOfflineReady() {
    console.log("App ready to work offline!");
    
    // You could show a toast notification:
    // toast.success("App ready for offline use!");
  },
  
  // When service worker is registered successfully
  onRegistered(registration) {
    console.log("Service Worker registered:", registration);
    
    // Optional: Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // 1 hour
    }
  },
  
  // When service worker registration fails
  onRegisterError(error) {
    console.error("Service Worker registration failed:", error);
  },
  
  // Register immediately when the app loads
  immediate: true,
});

// Render your React app (your existing code preserved)
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);