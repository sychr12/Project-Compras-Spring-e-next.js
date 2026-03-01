'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Package, Truck, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import api from '@/services/api';

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: { id: number; productId: number; quantity: number; price: number }[];
}

const STATUS_LIST = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: 'Pendente',    color: 'text-yellow-400 bg-yellow-900/20 border-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Confirmado',  color: 'text-blue-400 bg-blue-900/20 border-blue-800',       icon: Package },
  SHIPPED:   { label: 'Enviado',     color: 'text-purple-400 bg-purple-900/20 border-purple-800', icon: Truck },
  DELIVERED: { label: 'Entregue',    color: 'text-green-400 bg-green-900/20 border-green-800',    icon: CheckCircle },
  CANCELLED: { label: 'Cancelado',   color: 'text-red-400 bg-red-900/20 border-red-800',          icon: Clock },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = () => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast('Status atualizado!');
      fetchOrders();
    } catch {
      alert('Erro ao atualizar status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Truck size={28} className="text-white" />
          <h1 className="text-2xl font-bold text-white">Envio de Pedidos</h1>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${cfg.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{countByStatus(s)}</p>
                  <p className="text-zinc-400 text-xs">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtro */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors ${filterStatus === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
            Todos ({orders.length})
          </button>
          {STATUS_LIST.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors ${filterStatus === s ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
              {STATUS_CONFIG[s].label} ({countByStatus(s)})
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">Nenhum pedido encontrado.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING'];
              const Icon = cfg.icon;
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="p-5 flex items-center gap-4">
                    {/* ID */}
                    <div className="bg-zinc-800 rounded-xl px-3 py-2 text-center min-w-[60px]">
                      <p className="text-xs text-zinc-500">Pedido</p>
                      <p className="text-white font-bold">#{order.id}</p>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-sm font-medium ${cfg.color}`}>
                      <Icon size={14} />
                      {cfg.label}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-white font-semibold">R$ {Number(order.total).toFixed(2)}</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Mudar status */}
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {STATUS_LIST.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>

                    {/* Expandir itens */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                      {isExpanded ? 'Fechar' : 'Itens'}
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Itens expandidos */}
                  {isExpanded && order.items && (
                    <div className="border-t border-zinc-800 px-5 py-4 bg-zinc-950">
                      <p className="text-zinc-400 text-xs uppercase tracking-widest mb-3">Itens do pedido</p>
                      <div className="flex flex-col gap-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-300">Produto #{item.productId}</span>
                            <span className="text-zinc-400">{item.quantity}x</span>
                            <span className="text-white font-medium">R$ {Number(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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