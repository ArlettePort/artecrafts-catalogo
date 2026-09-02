import React, { useState } from 'react';
import {
  Sliders,
  Store,
  Phone,
  MessageCircle,
  Truck,
  RotateCcw,
  Save,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { StoreSettings, AdminUser } from '../../types';

interface AdminSettingsProps {
  settings: StoreSettings;
  currentUser: AdminUser;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDatabase: () => void;
  allProductsCount: number;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  currentUser,
  onSaveSettings,
  onResetDatabase,
  allProductsCount,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(settings.freeShippingThreshold)
  );
  const [shippingCost, setShippingCost] = useState(String(settings.shippingCost));

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      storeName: storeName.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      freeShippingThreshold: parseFloat(freeShippingThreshold) || 45,
      shippingCost: parseFloat(shippingCost) || 4.5,
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleExportBackup = () => {
    try {
      const productsRaw = localStorage.getItem('artecrafts_db_products_v2') || '[]';
      const categoriesRaw = localStorage.getItem('artecrafts_db_categories_v2') || '[]';
      const settingsRaw = localStorage.getItem('artecrafts_db_settings_v2') || '{}';

      const backup = {
        exportedAt: new Date().toISOString(),
        products: JSON.parse(productsRaw),
        categories: JSON.parse(categoriesRaw),
        settings: JSON.parse(settingsRaw),
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artecrafts-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting backup', e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Configuración de la Tienda
          </h2>
          <p className="text-xs text-stone-500">
            Ajusta los canales de contacto para pedidos, políticas de envío y datos del taller
          </p>
        </div>

        {isSavedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-fade-in">
            <CheckCircle2 size={14} />
            <span>Configuración guardada</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store Info */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2 flex items-center gap-2">
            <Store size={18} className="text-rose-500" />
            <span>Identidad & Contacto</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Nombre de la Marca
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Número de WhatsApp para Pedidos (con código de país)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="ej. 525512345678"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                Aquí recibirás los mensajes automáticos que los clientes envían desde el carrito.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Correo Electrónico de Contacto
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Teléfono de Atención
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Ubicación del Taller / Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Shipping settings */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2 flex items-center gap-2">
            <Truck size={18} className="text-rose-500" />
            <span>Condiciones de Envío</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Monto Mínimo para Envío Gratis ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 font-semibold"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Los clientes verán una barra de progreso que los motiva a agregar más productos para alcanzar este monto.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Costo Estándar de Envío ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 font-semibold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database & Backups card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2 flex items-center gap-2">
          <RotateCcw size={18} className="text-rose-500" />
          <span>Gestión de Base de Datos y Respaldos</span>
        </h3>

        <p className="text-xs text-stone-500">
          Actualmente tienes <strong>{allProductsCount} productos</strong> almacenados en la base de datos local.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Descargar Respaldo JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Restablecer a Datos Iniciales</span>
          </button>
        </div>

        {/* Reset confirmation modal */}
        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-fade-in text-xs">
            <div className="flex items-start gap-2.5 text-red-800">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">¿Confirmar restablecimiento?</strong>
                <span>
                  Esto restaurará el catálogo con las 14 piezas iniciales y reajustará categorías. Los productos personalizados añadidos manualmente se reiniciarán.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Sí, Restablecer Todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin credentials info card */}
      <div className="p-5 rounded-3xl bg-rose-50/60 border border-rose-100 text-xs text-stone-600 space-y-2">
        <div className="flex items-center gap-2 text-rose-900 font-bold">
          <ShieldCheck size={16} className="text-rose-600" />
          <span>Acceso Administrativo Protegido</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Sesión iniciada como <strong>{currentUser.name}</strong> ({currentUser.email}).
          Para cambiar de cuenta o proteger el equipo en computadoras compartidas, recuerda cerrar sesión al terminar tu trabajo.
        </p>
      </div>
    </div>
  );
};
