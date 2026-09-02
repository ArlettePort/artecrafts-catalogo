import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { BrandLogo } from '../BrandLogo';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToCatalog: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToCatalog,
}) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrUser.trim()) {
      setErrorMessage('Ingresa tu correo electrónico o usuario administrativo.');
      return;
    }

    if (!password) {
      setErrorMessage('Ingresa tu contraseña de acceso.');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.login(emailOrUser, password);
    setIsLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'Credenciales no válidas.');
    }
  };

  const handleUseDemoCredentials = () => {
    setEmailOrUser('admin@artecrafts.com');
    setPassword('artecrafts2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F6] via-[#FAF6F6] to-[#FCEEEF] flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCatalog}
          id="admin-login-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-full bg-white/70 border border-rose-100 hover:bg-white shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Volver al Catálogo Público</span>
        </button>

        <span className="text-[11px] font-medium text-rose-500 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck size={12} />
          Área Protegida
        </span>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-rose-950/5 border border-rose-100/80 p-6 sm:p-8 space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="md" variant="vertical" />
          </div>
          <div className="pt-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Panel Administrativo
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Ingresa tus credenciales para gestionar el catálogo de ArteCrafts
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
            >
              Correo Electrónico o Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail size={16} />
              </div>
              <input
                id="admin-email"
                type="text"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="admin@artecrafts.com"
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock size={16} />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="admin-submit-login-btn"
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials helper card */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100/90 text-xs space-y-2">
          <div className="flex items-center justify-between text-rose-900 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-rose-500" />
              Credenciales de prueba
            </span>
            <button
              type="button"
              onClick={handleUseDemoCredentials}
              className="text-[11px] text-rose-600 hover:text-rose-700 underline font-medium hover:font-semibold cursor-pointer"
            >
              Autocompletar
            </button>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Usuario:</strong> admin@artecrafts.com<br />
            <strong className="text-stone-700">Contraseña:</strong> artecrafts2026
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="mt-6 text-xs text-stone-400 text-center">
        ArteCrafts © 2026 • Sistema de Control de Catálogo e Inventario
      </p>
    </div>
  );
};
