'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SucessoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 flex flex-col items-center gap-6 shadow-2xl max-w-md w-full text-center">
        
        {/* Ícone animado */}
        <div className="bg-zinc-800 rounded-full p-6">
          <CheckCircle size={72} className="text-white" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Compra Realizada!</h1>
          <p className="text-zinc-400">Seu pedido foi confirmado e está sendo processado com sucesso.</p>
        </div>

        <div className="w-full bg-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Status</span>
            <span className="text-green-400 font-medium">Confirmado</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Envio</span>
            <span className="text-yellow-400 font-medium">Em processamento</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Pagamento</span>
            <span className="text-green-300 font-medium">Aprovado</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => router.push('/produtos')}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            Continuar comprando
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
          >
            Voltar ao início
          </button>
        </div>

      </div>
    </div>
  );
}