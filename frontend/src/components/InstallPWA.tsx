import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    // Check if previously dismissed
    if (localStorage.getItem("pwa-install-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const isIosSafari =
      /iphone|ipad|ipod/i.test(ua) &&
      /safari/i.test(ua) &&
      !/crios|fxios|opios|mercury/i.test(ua);

    if (isIosSafari) {
      setIsIos(true);
      setTimeout(() => setShowBanner(true), 2000);
      return;
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check installed state
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
  };

  if (isInstalled || dismissed || !showBanner) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div className="pwa-overlay" onClick={handleDismiss} />

      <div className="pwa-banner" role="dialog" aria-label="Install NestPredict app">
        {/* Dismiss button */}
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="pwa-icon-wrap">
          <img src="/icon-192x192.png" alt="NestPredict" className="pwa-app-icon" />
          <div className="pwa-badge">
            <Smartphone size={12} />
          </div>
        </div>

        {/* Content */}
        <div className="pwa-content">
          <h3 className="pwa-title">Install NestPredict</h3>
          <p className="pwa-subtitle">
            {isIos
              ? 'Tap the Share icon then "Add to Home Screen" to install'
              : "Add to your home screen for the full app experience"}
          </p>

          {/* Feature pills */}
          <div className="pwa-features">
            <span className="pwa-pill">⚡ Works Offline</span>
            <span className="pwa-pill">🔔 Notifications</span>
            <span className="pwa-pill">📱 Native Feel</span>
          </div>

          {!isIos && (
            <div className="pwa-actions">
              <button className="pwa-install-btn" onClick={handleInstall}>
                <Download size={16} />
                Install App
              </button>
              <button className="pwa-later-btn" onClick={handleDismiss}>
                Not now
              </button>
            </div>
          )}

          {isIos && (
            <div className="pwa-ios-hint">
              <span>Tap</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L8 6h3v8h2V6h3L12 2zm-7 14v4h14v-4H5z" />
              </svg>
              <span>then "Add to Home Screen"</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InstallPWA;
