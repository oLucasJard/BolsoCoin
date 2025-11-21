'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Verificar se já foi instalado ou rejeitado
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Mostrar após 3 segundos
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-c6-gray-900 rounded-c6-lg border-2 border-c6-yellow p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-c6-yellow rounded-c6-md flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💰</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white mb-1">
              Instalar BolsoCoin
            </h3>
            <p className="text-sm text-c6-gray-300 mb-3">
              Instale o app no seu dispositivo para acesso rápido e funcionalidades offline!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-c6-yellow hover:bg-c6-yellow-hover text-c6-black font-bold rounded-c6-sm transition-all touch-manipulation"
              >
                <Download size={16} />
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-c6-gray-800 hover:bg-c6-gray-700 text-c6-gray-300 rounded-c6-sm transition-all touch-manipulation"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

