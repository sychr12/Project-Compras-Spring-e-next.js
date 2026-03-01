'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Trash2, ShoppingBag, CreditCard, Lock } from 'lucide-react';
import api from '@/services/api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CarrinhoPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [payment, setPayment] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    const updated = cart.map((item) => item.id === id ? { ...item, quantity } : item);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!payment.cardName || !payment.cardNumber || !payment.expiry || !payment.cvv) {
      alert('Preencha todos os dados do cartão.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        total,
        status: 'PENDING',
      });
      localStorage.removeItem('cart');
      router.push('/sucesso');
    } catch {
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-500 mt-20">
          <ShoppingBag size={64} />
          <p className="text-lg">Seu carrinho está vazio.</p>
          <button onClick={() => router.push('/produtos')}
            className="bg-white text-black px-6 py-2 rounded-xl hover:bg-zinc-200 transition-colors font-medium">
            Ver produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'cart' ? 'text-white' : 'text-zinc-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'cart' ? 'bg-white text-black' : 'bg-zinc-700 text-zinc-400'}`}>1</span>
            Carrinho
          </div>
          <div className="flex-1 h-px bg-zinc-800" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'payment' ? 'text-white' : 'text-zinc-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-white text-black' : 'bg-zinc-700 text-zinc-400'}`}>2</span>
            Pagamento
          </div>
        </div>

        {step === 'cart' && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white mb-2">Meu Carrinho</h1>
            {cart.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-zinc-800 rounded-xl w-16 h-16 flex items-center justify-center text-3xl">🛍️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-zinc-400">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold">-</button>
                  <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold">+</button>
                </div>
                <p className="w-24 text-right font-semibold text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors ml-2">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">Total</span>
                <span className="text-2xl font-bold text-white">R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={() => setStep('payment')}
                className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <CreditCard size={20} />
                Ir para pagamento
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep('cart')} className="text-zinc-400 hover:text-white transition-colors text-sm">← Voltar</button>
              <h1 className="text-2xl font-bold text-white">Pagamento</h1>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Lock size={14} />
                Pagamento seguro e criptografado
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome no cartão</label>
                <input type="text" value={payment.cardName}
                  onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                  placeholder="NOME SOBRENOME" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Número do cartão</label>
                <input type="text" value={payment.cardNumber} maxLength={19}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setPayment({ ...payment, cardNumber: v });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                  placeholder="0000 0000 0000 0000" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Validade</label>
                  <input type="text" value={payment.expiry} maxLength={5}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                      setPayment({ ...payment, expiry: v });
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                    placeholder="MM/AA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">CVV</label>
                  <input type="text" value={payment.cvv} maxLength={3}
                    onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                    placeholder="000" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">Total a pagar</span>
                <span className="text-2xl font-bold text-white">R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={loading}
                className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 text-black font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}