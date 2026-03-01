'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import api from '@/services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setToast(`${product.name} adicionado!`);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-around text-sm text-zinc-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">👤</span>
            <span>Cadastro de Clientes</span>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💳</span>
            <span>Processamento de Pagamentos</span>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🏪</span>
            <span>Controle de Estoque</span>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">📦</span>
            <span>Envio de Pedidos</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500 w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-20 text-lg">
            Nenhum produto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white text-black font-medium px-6 py-3 rounded-2xl shadow-2xl">
          ✅ {toast}
        </div>
      )}
    </div>
  );
}