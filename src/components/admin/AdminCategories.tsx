import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Save,
  X,
  Image as ImageIcon,
  Flame,
  Coffee,
  Gem,
  BookOpen,
  Scissors,
  Heart,
} from 'lucide-react';
import { Category } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  onSaveCategory: (categoryData: Partial<Category> & { name: string }, categoryId?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleCategoryStatus: (categoryId: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Flame', icon: Flame },
  { name: 'Coffee', icon: Coffee },
  { name: 'Gem', icon: Gem },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Scissors', icon: Scissors },
  { name: 'Heart', icon: Heart },
  { name: 'Layers', icon: Layers },
];

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onSaveCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [iconName, setIconName] = useState('Sparkles');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setTagline('');
    setImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80');
    setImageFile(null);
    setImagePreview('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80');
    setIconName('Sparkles');
    setStatus('active');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setTagline(category.tagline || '');
    setImageUrl(category.image || '');
    setImageFile(null);
    setImagePreview(category.image || '');
    setIconName(category.iconName || 'Sparkles');
    setStatus(category.status || 'active');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre de la categoría es obligatorio.');
      return;
    }

    if (!imagePreview) {
      setErrorMessage('Debes agregar una imagen para la categoría.');
      return;
    }

    onSaveCategory(
      {
        name: name.trim(),
        description: description.trim(),
        tagline: tagline.trim() || name.trim(),
        image: imagePreview,
        iconName,
        status,
      },
      editingCategory?.id
    );

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Líneas de Creación & Categorías
          </h2>
          <p className="text-xs text-stone-500">
            Organiza las secciones y colecciones artesanales que exploran tus clientes
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          id="admin-add-category-btn"
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const isAll = category.id === 'todos';
          const isActive = category.status !== 'inactive';

          return (
            <div
              key={category.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-2xs flex flex-col justify-between ${
                isActive ? 'border-rose-100/90' : 'border-stone-200 opacity-60'
              }`}
            >
              <div>
                {/* Image & Header */}
                <div className="h-32 relative overflow-hidden bg-rose-50">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {category.itemCount || 0} artículos
                      </span>
                      <h3 className="font-serif text-lg font-bold leading-tight drop-shadow-xs">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-600 text-white'
                      }`}
                    >
                      {isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2 text-xs">
                  <p className="text-stone-600 italic">
                    "{category.tagline || 'Colección artesanal ArteCrafts'}"
                  </p>
                  {category.description && (
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      {category.description}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-400 font-mono">
                    ID clave: {category.id}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-2 border-t border-rose-50 flex items-center justify-between">
                {isAll ? (
                  <span className="text-[11px] text-stone-400 italic">
                    Categoría maestra protegida
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggleCategoryStatus(category.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Desactivar' : 'Activar'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(category)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Editar categoría"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCategory(category.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
            <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Macramé & Tapices"
                  required
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Lema o Frase Corta
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="ej. Nudos tradicionales en algodón crudo"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Imagen de Portada *
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative h-32 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        title="Eliminar imagen"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-rose-300 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
                    <div className="text-center">
                      <ImageIcon size={24} className="mx-auto mb-1 text-rose-500" />
                      <span className="text-xs font-semibold text-stone-700">
                        Haz clic para subir una foto
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        PNG, JPG o WebP (máx. 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="active">Activa (Visible en catálogo)</option>
                  <option value="inactive">Inactiva (Oculta)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} />
                  <span>Guardar Categoría</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
