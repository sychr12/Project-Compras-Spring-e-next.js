'use client';

import { ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-600 transition-colors">
      {/* Imagem */}
      <div className="h-44 bg-zinc-800 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🛍️</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h2 className="text-base font-semibold text-white">{product.name}</h2>
        <p className="text-zinc-400 text-sm flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white font-bold text-lg">R$ {Number(product.price).toFixed(2)}</span>
          <span className="text-xs text-zinc-500">Estoque: {product.stock}</span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart size={18} />
          {product.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  );
}