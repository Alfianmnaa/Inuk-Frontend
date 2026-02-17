import { useState, useEffect } from "react";

// TypeScript interface for the browser's install prompt event
// This isn't in the standard TypeScript types, so we define it ourselves
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  // Store the install prompt event so we can trigger it later
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Track whether to show our custom install button
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // This event fires when the browser determines your PWA is installable
    // It happens when: manifest is valid, service worker registered, HTTPS
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser's default mini-infobar from appearing
      e.preventDefault();

      // Save the event so we can trigger it later with our button
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show our custom install button
      setShowInstallButton(true);

      console.log("PWA installable! Install prompt will show.");
    };

    // This fires when the PWA is successfully installed
    const handleAppInstalled = () => {
      console.log("PWA installed successfully!");

      // Hide the install button since the app is now installed
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Listen for these events
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle the install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No install prompt available");
      return;
    }

    // Show the browser's native install dialog
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Install prompt outcome: ${outcome}`);

    // Clear the prompt (it can only be used once)
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Don't render anything if install button shouldn't be shown
  if (!showInstallButton) {
    return null;
  }

  // Render a custom install prompt at the bottom of the screen
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="bg-emerald-500 text-white rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up">
        {/* Download icon */}
        <div className="shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install INUK</p>
          <p className="text-xs opacity-90 truncate">
            Install aplikasi untuk akses lebih cepat
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white text-emerald-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-500"
            aria-label="Install aplikasi INUK"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-white hover:bg-emerald-600 px-2 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-500"
            aria-label="Tutup prompt install"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}