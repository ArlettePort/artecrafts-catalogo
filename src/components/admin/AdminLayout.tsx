import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  PlusCircle,
  Store,
  ChevronRight,
} from 'lucide-react';
import { AdminUser } from '../../types';
import { BrandLogo } from '../BrandLogo';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'inventory' | 'settings';

interface AdminLayoutProps {
  currentSection?: AdminTab;
  currentTab?: AdminTab;
  onSelectSection?: (section: AdminTab) => void;
  onSelectTab?: (tab: AdminTab) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  onGoToPublicCatalog: () => void;
  onAddNewProduct?: () => void;
  productsCount?: number;
  categoriesCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  currentTab,
  onSelectSection,
  onSelectTab,
  currentUser,
  onLogout,
  onGoToPublicCatalog,
  onAddNewProduct,
  productsCount,
  categoriesCount,
  children,
}) => {
  const activeTab = currentSection || currentTab || 'dashboard';
  const handleSelectTab = (tab: AdminTab) => {
    if (onSelectSection) onSelectSection(tab);
    else if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Resumen y métricas',
    },
    {
      id: 'products' as AdminTab,
      label: 'Productos',
      icon: Package,
      desc: 'Catálogo completo',
    },
    {
      id: 'categories' as AdminTab,
      label: 'Categorías',
      icon: Layers,
      desc: 'Líneas artesanales',
    },
    {
      id: 'orders' as AdminTab,
      label: 'Pedidos',
      icon: Boxes,
      desc: 'Gestión de ventas',
    },
    {
      id: 'inventory' as AdminTab,
      label: 'Inventario & Stock',
      icon: Boxes,
      desc: 'Disponibilidad rápida',
    },
    {
      id: 'settings' as AdminTab,
      label: 'Configuración',
      icon: Sliders,
      desc: 'Datos de tienda',
    },
  ];

  const handleTabClick = (tab: AdminTab) => {
    handleSelectTab(tab);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Panel Principal';
      case 'products':
        return 'Gestión de Productos';
      case 'categories':
        return 'Gestión de Categorías';
      case 'orders':
        return 'Gestión de Pedidos';
      case 'inventory':
        return 'Control de Stock e Inventario';
      case 'settings':
        return 'Configuración de Tienda';
      default:
        return 'Administración';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F6] text-stone-800 flex flex-col md:flex-row">
      {/* Mobile top navigation bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="admin-mobile-menu-toggle"
          className="p-2 -ml-1 text-stone-600 hover:text-rose-600 rounded-xl hover:bg-rose-50"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <BrandLogo size="sm" variant="horizontal" />

        <button
          onClick={onGoToPublicCatalog}
          className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-full border border-rose-200/80 flex items-center gap-1"
          title="Ver catálogo cliente"
        >
          <Store size={14} />
          <span className="hidden xs:inline">Catálogo</span>
        </button>
      </header>

      {/* Mobile slide-over drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-fade-in border-r border-rose-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <BrandLogo size="sm" variant="horizontal" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick new product action */}
              {onAddNewProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAddNewProduct();
                  }}
                  className="w-full py-2.5 px-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} />
                  <span>+ Agregar Producto</span>
                </button>
              )}

              {/* Nav items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'bg-rose-100/70 text-rose-900 font-semibold shadow-xs'
                          : 'text-stone-600 hover:bg-rose-50/60 hover:text-rose-700'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? 'text-rose-600' : 'text-stone-400'}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-rose-100 space-y-3">
              <button
                onClick={onGoToPublicCatalog}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100"
              >
                <span className="flex items-center gap-2">
                  <Store size={15} />
                  Ver Catálogo Cliente
                </span>
                <ExternalLink size={13} />
              </button>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-stone-800 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-stone-400">Administrador</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-rose-100/90 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand header */}
        <div className="p-6 border-b border-rose-100/70">
          <BrandLogo size="md" variant="horizontal" />
          <div className="mt-3 flex items-center justify-between bg-rose-50/60 border border-rose-100 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1.5">
              <Sparkles size={12} className="text-rose-500" />
              Panel de Control
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-white px-2 py-0.5 rounded-md shadow-2xs">
              Admin
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        {onAddNewProduct && (
          <div className="px-5 pt-4 pb-2">
            <button
              type="button"
              onClick={onAddNewProduct}
              id="admin-sidebar-add-product-btn"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-500/20 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <PlusCircle size={16} />
              <span>Crear Producto</span>
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                id={`admin-nav-${item.id}`}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-rose-100/80 text-rose-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:bg-rose-50/60 hover:text-rose-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-rose-600' : 'text-stone-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-rose-500" />}
              </button>
            );
          })}
        </nav>

        {/* Client catalog preview button */}
        <div className="p-4 border-t border-rose-100/80 space-y-3">
          <button
            type="button"
            onClick={onGoToPublicCatalog}
            id="admin-view-client-catalog-btn"
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Store size={15} className="text-rose-500" />
              Ver Catálogo Público
            </span>
            <ExternalLink size={13} className="text-stone-400" />
          </button>

          {/* Admin User Info */}
          <div className="flex items-center justify-between pt-2 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-200 to-rose-100 flex items-center justify-center text-xs font-bold text-rose-800 shrink-0 border border-rose-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-stone-800 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-stone-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              id="admin-logout-btn"
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header */}
        <div className="hidden md:flex sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100/90 px-8 py-3.5 items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              ArteCrafts Admin
            </span>
            <h1 className="font-serif text-xl font-bold text-stone-900 leading-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToPublicCatalog}
              className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-full transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Store size={14} className="text-rose-500" />
              <span>Tienda en vivo</span>
            </button>

            <button
              type="button"
              onClick={onAddNewProduct}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
