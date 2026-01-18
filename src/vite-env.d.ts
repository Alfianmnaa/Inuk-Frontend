/// <reference types="vite/client" />

// Type declarations for the virtual PWA module
// This tells TypeScript about the registerSW function from vite-plugin-pwa
declare module "virtual:pwa-register" {
  // Options you can pass to registerSW()
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  // The registerSW function itself
  // Returns a function that can force reload the page with the new service worker
  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}