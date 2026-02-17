import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { registerSW } from "virtual:pwa-register";

// TEMPORARY: Force unregister old service worker
// Comment this code after 1 week when all users have updated
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('🗑️ Old service worker unregistered');
    });
  });
}

// Store the updateSW function so we can call it from the toast button
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("🔄 New version available!");
    
    // Show a custom toast with an update button
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <svg 
              className="w-6 h-6 text-emerald-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">
              Versi Baru Tersedia!
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Klik perbarui untuk mendapatkan fitur terbaru
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                // Reload the page with the new service worker
                updateSW(true);
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Perbarui
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-500 hover:text-gray-700 px-2 py-2 rounded-md text-sm transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Don't auto-dismiss
        position: "bottom-center",
        style: {
          minWidth: "400px",
          maxWidth: "600px",
        },
      }
    );
  },

  onOfflineReady() {
    console.log("✅ App ready to work offline!");
    
    // Optional: Show a success toast
    toast.success("Aplikasi siap digunakan offline!", {
      duration: 3000,
      position: "bottom-center",
    });
  },

  onRegistered(registration) {
    console.log("✅ Service Worker registered successfully");
    
    // Check for updates every 1 hour
    if (registration) {
      setInterval(() => {
        console.log("🔍 Checking for updates...");
        registration.update();
      }, 60 * 60 * 1000);
    }
  },

  onRegisterError(error) {
    console.error("❌ Service Worker registration failed:", error);
    
    // Show error toast
    toast.error("Gagal mendaftarkan service worker", {
      duration: 5000,
      position: "bottom-center",
    });
  },

  immediate: true,
});

// Render your React app
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);