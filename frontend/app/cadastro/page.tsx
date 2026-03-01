'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import api from '@/services/api';

interface CadastroForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CadastroForm>();

  const onSubmit = async (data: CadastroForm) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/users', {
        name: data.name,
        email: data.email,
        password: data.password,
        cpf: data.cpf,
        telefone: data.telefone,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
      });
      router.push('/login');
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
          <p className="text-zinc-400 mt-1 text-sm">Preencha seus dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Dados de acesso */}
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Dados de Acesso</p>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nome completo</label>
            <input type="text" {...register('name', { required: 'Nome obrigatório' })}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
              placeholder="Seu nome" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" {...register('email', { required: 'Email obrigatório' })}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
              placeholder="seu@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
              <input type="password" {...register('password', { required: 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Confirmar Senha</label>
              <input type="password" {...register('confirmPassword', { required: 'Confirme sua senha', validate: (val) => val === watch('password') || 'Senhas não coincidem' })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Dados pessoais */}
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Dados Pessoais</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">CPF</label>
              <input type="text" {...register('cpf')}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Telefone</label>
              <input type="text" {...register('telefone')}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="(00) 00000-0000" />
            </div>
          </div>

          {/* Endereço */}
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Endereço</p>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Endereço</label>
            <input type="text" {...register('endereco')}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
              placeholder="Rua, número, complemento" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-zinc-300 mb-1">CEP</label>
              <input type="text" {...register('cep')}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="00000-000" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Cidade</label>
              <input type="text" {...register('cidade')}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="Cidade" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Estado</label>
              <input type="text" {...register('estado')} maxLength={2}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                placeholder="SP" />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-600 text-black font-semibold py-3 rounded-xl transition-colors mt-2">
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-white font-medium hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}