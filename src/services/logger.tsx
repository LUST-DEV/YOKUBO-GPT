import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ClientErrorLog {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  location: string;
  userAgent: string;
  timestamp: string;
}

export const logExceptionToServer = async (error: Error, componentStack?: string): Promise<void> => {
  try {
    const payload: ClientErrorLog = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack,
      location: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    await fetch('/api/logs/client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to send exception log to server:', err);
  }
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    logExceptionToServer(error, errorInfo.componentStack || undefined);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#050308] text-slate-100 flex flex-col items-center justify-center p-4 text-center font-sans selection:bg-purple-900/30">
          <div className="glass-panel p-8 max-w-md w-full rounded-2xl border border-red-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mx-auto mb-6 border border-red-500/20">
              <span className="text-2xl font-bold font-mono">!</span>
            </div>
            <h1 className="text-xl font-display uppercase tracking-widest text-slate-100 mb-2">Une anomalie est survenue</h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              L'interface a rencontré une exception inattendue. Nos systèmes de cyber-sécurité ont automatiquement capturé et journalisé cet incident.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-semibold rounded-xl text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-purple-500/20"
              >
                Recharger l'Application
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full py-2 px-4 text-xs text-slate-400 hover:text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                Réinitialiser la Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
