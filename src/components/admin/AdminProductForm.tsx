import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Star,
  Sparkles,
  CheckCircle,
  Eye,
  AlertCircle,
  Save,
  Trash2,
  Plus,
  ArrowLeft,
  Sliders,
  Layers,
} from 'lucide-react';
import { Product, Category, ProductStatus } from '../../types';
import { optimizeImage } from '../../utils/imageOptimizer';
import { AdminProductPreviewModal } from './AdminProductPreviewModal';

interface AdminProductFormProps {
  initialProduct?: Product | null;
  categories: Category[];
  onSave: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>, productId?: string) => void;
  onCancel: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  categories,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialProduct;

  // Form states
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [category, setCategory] = useState(initialProduct?.category || (categories[1]?.id || 'velas'));
  const [price, setPrice] = useState<string>(initialProduct?.price ? String(initialProduct.price) : '');
  const [originalPrice, setOriginalPrice] = useState<string>(initialProduct?.originalPrice ? String(initialProduct.originalPrice) : '');
  
  // Stock & Availability
  const [manageStock, setManageStock] = useState<boolean>(initialProduct?.manageStock !== false);
  const [stock, setStock] = useState<string>(initialProduct?.stock !== undefined ? String(initialProduct.stock) : '10');
  
  // Status and Badges
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'published');
  const [isFeatured, setIsFeatured] = useState<boolean>(!!initialProduct?.isFeatured);
  const [isNew, setIsNew] = useState<boolean>(!!initialProduct?.isNew);
  
  // Extra fields
  const [materialsInput, setMaterialsInput] = useState<string>(initialProduct?.materials?.join(', ') || '');
  const [dimensions, setDimensions] = useState<string>(initialProduct?.dimensions || '');

  // Images state
  const [images, setImages] = useState<string[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images;
    }
    if (initialProduct?.mainImage) {
      return [initialProduct.mainImage];
    }
    return [];
  });
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  // Manual URL input
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // UI / Processing state
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active categories only (exclude 'todos')
  const validCategories = categories.filter((c) => c.id !== 'todos' && c.status !== 'inactive');

  // Handle image files (both from input or drag-and-drop)
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessingImage(true);
    setErrorMessage(null);

    const newUploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const optimizedDataUrl = await optimizeImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
          });
          newUploadedUrls.push(optimizedDataUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...newUploadedUrls]);
      } else {
        setErrorMessage('No se encontraron imágenes válidas en la selección.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen.';
      setErrorMessage(msg);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) return;
    setImages((prev) => [...prev, manualImageUrl.trim()]);
    setManualImageUrl('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (mainImageIndex >= updated.length) {
        setMainImageIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  // Construct draft product for live preview
  const getDraftProduct = (): Product => {
    const mainImg = images[mainImageIndex] || images[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
    return {
      id: initialProduct?.id || 'draft-preview',
      name: name.trim() || 'Nuevo Producto Artesanal',
      description: description.trim() || 'Descripción detallada de la pieza artesanal...',
      shortDescription: shortDescription.trim() || 'Pieza hecha a mano con dedicación.',
      category,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      mainImage: mainImg,
      images: images.length > 0 ? images : [mainImg],
      stock: manageStock ? parseInt(stock, 10) || 0 : 99,
      manageStock,
      isAvailable: manageStock ? (parseInt(stock, 10) || 0) > 0 : true,
      status,
      isFeatured,
      isNew,
      rating: initialProduct?.rating || 5.0,
      reviewsCount: initialProduct?.reviewsCount || 1,
      materials: materialsInput
        ? materialsInput.split(',').map((m) => m.trim()).filter(Boolean)
        : ['Materiales artesanales'],
      dimensions: dimensions.trim() || undefined,
    };
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!name.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor agrega una descripción para el producto.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Por favor ingresa un precio válido mayor a 0.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Debes subir o agregar al menos una imagen para el producto.');
      return;
    }

    const parsedStock = manageStock ? parseInt(stock, 10) : 0;
    if (manageStock && (isNaN(parsedStock) || parsedStock < 0)) {
      setErrorMessage('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    const materialsArray = materialsInput
      ? materialsInput.split(',').map((m) => m.trim()).filter(Boolean)
      : undefined;

    const mainImg = images[mainImageIndex] || images[0];

    const productPayload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'> = {
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim() || name.trim(),
      category,
      price: parsedPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      mainImage: mainImg,
      images,
      stock: manageStock ? parsedStock : 0,
      manageStock,
      status,
      isFeatured,
      isNew,
      materials: materialsArray,
      dimensions: dimensions.trim() || undefined,
      variants: initialProduct?.variants,
    };

    onSave(productPayload, initialProduct?.id);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto Artesanal'}
            </h2>
            <p className="text-xs text-stone-500">
              {isEditing
                ? `Actualiza la información de "${initialProduct.name}"`
                : 'Completa los campos para publicar una nueva creación en el catálogo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Preview button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            id="admin-form-preview-btn"
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Eye size={15} />
            <span>Vista Previa</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            id="admin-form-save-btn"
            className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-sm shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={15} />
            <span>{isEditing ? 'Guardar Cambios' : 'Publicar Producto'}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2">
              Información Principal
            </h3>

            {/* Product Name */}
            <div>
              <label
                htmlFor="product-name"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Nombre del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Vela Aromática Floral de Cera de Soya"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Short Description */}
            <div>
              <label
                htmlFor="product-short-desc"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Descripción Breve (para tarjetas)
              </label>
              <input
                id="product-short-desc"
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="ej. Elaborada a mano con flores silvestres y aroma a vainilla francesa"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Full Description */}
            <div>
              <label
                htmlFor="product-description"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Descripción Completa <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la técnica artesanal, los detalles sensoriales, el proceso de elaboración y recomendaciones de cuidado..."
                required
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-50 pb-2">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Fotografías del Producto <span className="text-rose-500">*</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Sube fotos claras con buena iluminación. Se optimizarán automáticamente para web.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                {showUrlInput ? 'Ocultar URL' : '+ Agregar por URL'}
              </button>
            </div>

            {/* Manual URL input drawer */}
            {showUrlInput && (
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex gap-2">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600"
                >
                  Agregar
                </button>
              </div>
            )}

            {/* Drag and Drop / File upload zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-rose-500 bg-rose-50/80 scale-[1.01]'
                  : 'border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Upload size={22} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-stone-800">
                    {isProcessingImage ? (
                      <span className="text-rose-600 animate-pulse font-bold">
                        Optimizando imagen para web...
                      </span>
                    ) : (
                      'Haz clic para subir o arrastra tus imágenes aquí'
                    )}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    JPG, PNG o WebP (resolución recomendada: 1000 x 1000 px)
                  </p>
                </div>
              </div>
            </div>

            {/* Images Preview List */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Imágenes cargadas ({images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => {
                    const isMain = idx === mainImageIndex;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border-2 group aspect-square bg-stone-100 ${
                          isMain ? 'border-rose-500 shadow-sm ring-2 ring-rose-200' : 'border-stone-200'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Badges */}
                        {isMain && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            Principal
                          </span>
                        )}

                        {/* Action buttons on hover / overlay */}
                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="self-end p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Eliminar imagen"
                          >
                            <Trash2 size={13} />
                          </button>

                          {!isMain && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(idx);
                              }}
                              className="w-full py-1 text-[10px] font-bold bg-white/90 hover:bg-white text-stone-900 rounded-md transition-colors"
                            >
                              Hacer Principal
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details & Specs Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2">
              Detalles Artesanales y Medidas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-materials"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Materiales (separados por coma)
                </label>
                <input
                  id="product-materials"
                  type="text"
                  value={materialsInput}
                  onChange={(e) => setMaterialsInput(e.target.value)}
                  placeholder="Cera de soya, Mecha de algodón, Flores prensadas"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="product-dimensions"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Dimensiones / Peso
                </label>
                <input
                  id="product-dimensions"
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="ej. 8.5 cm de diámetro x 10 cm de alto (250 g)"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings, Pricing & Inventory (1 col) */}
        <div className="space-y-6">
          {/* Status & Publication Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2">
              Estado de Publicación
            </h3>

            <div>
              <label
                htmlFor="product-status"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Estado en Catálogo
              </label>
              <select
                id="product-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all font-medium"
              >
                <option value="published">🟢 Publicado (Visible en tienda)</option>
                <option value="hidden">🟡 Oculto (Solo visible en admin)</option>
                <option value="draft">⚪ Borrador</option>
              </select>
            </div>

            {/* Badges switches */}
            <div className="space-y-3 pt-2 border-t border-rose-50">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Star
                    size={16}
                    className={isFeatured ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Producto Destacado
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Aparecerá en el inicio de la tienda
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-md focus:ring-rose-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sparkles
                    size={16}
                    className={isNew ? 'text-rose-500' : 'text-stone-400'}
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Marcar como Novedad
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Muestra la etiqueta "Nuevo"
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-md focus:ring-rose-400"
                />
              </label>
            </div>
          </div>

          {/* Pricing & Category Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2">
              Precio y Categoría
            </h3>

            {/* Category */}
            <div>
              <label
                htmlFor="product-category"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              >
                {validCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Precio de Venta ($) <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="18.50"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all font-semibold"
              />
            </div>

            {/* Original Price / Discount */}
            <div>
              <label
                htmlFor="product-original-price"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Precio Original / Antes ($) (Opcional)
              </label>
              <input
                id="product-original-price"
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="22.00"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Si es mayor al precio de venta, se mostrará tachado con descuento.
              </span>
            </div>
          </div>

          {/* Inventory & Stock Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-rose-50 pb-2">
              Inventario & Disponibilidad
            </h3>

            {/* Mode: Managed stock vs Custom on-demand */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!manageStock}
                  onChange={(e) => setManageStock(!e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-md focus:ring-rose-400"
                />
                <span>Producto personalizado bajo pedido (sin límite de stock)</span>
              </label>
            </div>

            {manageStock ? (
              <div>
                <label
                  htmlFor="product-stock"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Unidades Disponibles en Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Si el stock es <strong>0</strong>, el producto se marcará automáticamente como <strong>"Agotado"</strong> y el cliente no podrá agregarlo al carrito.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs">
                ✨ Este artículo se elabora a mano bajo encargo del cliente sin límite de inventario.
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Floating Preview Modal */}
      <AdminProductPreviewModal
        isOpen={isPreviewOpen}
        product={getDraftProduct()}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
