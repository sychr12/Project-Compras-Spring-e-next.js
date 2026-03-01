'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, LogOut, Package, BarChart2, Truck } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      <Link href="/produtos" className="text-xl font-bold text-white flex items-center gap-2">
        <Package size={24} />
        Compras App
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/produtos" className="text-zinc-400 hover:text-white font-medium transition-colors">
          Produtos
        </Link>
        <Link href="/estoque" className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
          <BarChart2 size={18} />
          Estoque
        </Link>
        <Link href="/pedidos" className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
          <Truck size={18} />
          Pedidos
        </Link>
        <Link href="/carrinho" className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
          <ShoppingCart size={20} />
          Carrinho
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-1 text-zinc-400 hover:text-red-400 font-medium transition-colors">
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </nav>
  );
}