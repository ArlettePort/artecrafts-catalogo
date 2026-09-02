import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types';

interface AdminDeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const AdminDeleteConfirmModal: React.FC<AdminDeleteConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!isOpen || !product) return null;

  const displayImage = product.mainImage || (product.images && product.images[0]) || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Warning header */}
        <div className="bg-rose-50/80 p-5 border-b border-rose-100/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              ¿Eliminar producto?
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Esta acción eliminará el producto del catálogo y no se podrá deshacer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Details summary */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-xs">
                Sin foto
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="font-serif text-sm font-bold text-stone-800 truncate">
                {product.name}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Precio: <span className="font-semibold text-rose-600">${product.price.toFixed(2)}</span> • Stock: {product.stock}
              </p>
              <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                ID: {product.id}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl">
            ⚠️ Si solo deseas que no se muestre a los clientes temporalmente, puedes marcarlo como <strong>"Oculto"</strong> en lugar de eliminarlo definitivamente.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirmDelete(product.id)}
              disabled={isDeleting}
              id="admin-confirm-delete-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
