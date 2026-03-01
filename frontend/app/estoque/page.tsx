'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Plus, Pencil, Trash2, X, Check, Package, Upload } from 'lucide-react';
import api from '@/services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '' };

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingStock, setEditingStock] = useState<{ id: number; value: string } | null>(null);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = () => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, imageUrl: res.data.url }));
      showToast('Imagem enviada!');
    } catch {
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), imageUrl: p.imageUrl || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) return alert('Preencha todos os campos obrigatórios.');
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), stock: parseInt(form.stock),
        imageUrl: form.imageUrl || null,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast('Produto atualizado!');
      } else {
        await api.post('/products', payload);
        showToast('Produto adicionado!');
      }
      setShowModal(false);
      fetchProducts();
    } catch { alert('Erro ao salvar produto.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Produto removido!');
      fetchProducts();
    } catch { alert('Erro ao remover produto.'); }
  };

  const handleStockSave = async (id: number) => {
    if (!editingStock) return;
    try {
      await api.patch(`/products/${id}/stock`, { stock: parseInt(editingStock.value) });
      showToast('Estoque atualizado!');
      setEditingStock(null);
      fetchProducts();
    } catch { alert('Erro ao atualizar estoque.'); }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-400 bg-red-900/20 border-red-800';
    if (stock <= 5) return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
    return 'text-green-400 bg-green-900/20 border-green-800';
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package size={28} className="text-white" />
            <h1 className="text-2xl font-bold text-white">Controle de Estoque</h1>
          </div>
          <button onClick={openAdd}
            className="bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <Plus size={18} /> Novo Produto
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{products.length}</p>
            <p className="text-zinc-400 text-sm mt-1">Total de Produtos</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</p>
            <p className="text-zinc-400 text-sm mt-1">Estoque Baixo</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{products.filter(p => p.stock === 0).length}</p>
            <p className="text-zinc-400 text-sm mt-1">Sem Estoque</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Foto</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Produto</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Descrição</th>
                <th className="text-right text-zinc-400 text-sm font-medium px-6 py-4">Preço</th>
                <th className="text-center text-zinc-400 text-sm font-medium px-6 py-4">Estoque</th>
                <th className="text-center text-zinc-400 text-sm font-medium px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-zinc-500 py-12">Carregando...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        : <span className="text-xl">🛍️</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs truncate">{product.description}</td>
                  <td className="px-6 py-4 text-right text-white">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {editingStock?.id === product.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" value={editingStock.value}
                          onChange={(e) => setEditingStock({ id: product.id, value: e.target.value })}
                          className="w-20 bg-zinc-800 border border-zinc-600 text-white rounded-lg px-2 py-1 text-center focus:outline-none" />
                        <button onClick={() => handleStockSave(product.id)} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                        <button onClick={() => setEditingStock(null)} className="text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
                      </div>
                    ) : (
                      <span onClick={() => setEditingStock({ id: product.id, value: String(product.stock) })}
                        className={`inline-block border rounded-lg px-3 py-1 text-sm font-medium cursor-pointer hover:opacity-80 ${getStockColor(product.stock)}`}>
                        {product.stock} un
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(product)} className="text-zinc-400 hover:text-white transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Upload de imagem */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Foto do produto</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {form.imageUrl
                      ? <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-3xl">🛍️</span>
                    }
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      <Upload size={16} />
                      {uploading ? 'Enviando...' : 'Escolher imagem'}
                    </button>
                    {form.imageUrl && <p className="text-green-400 text-xs mt-1">✅ Imagem carregada</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                  placeholder="Nome do produto" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                  placeholder="Descrição do produto" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Preço *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Estoque *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-500"
                    placeholder="0" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleSave}
                className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-xl transition-colors">
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white text-black font-medium px-6 py-3 rounded-2xl shadow-2xl">✅ {toast}</div>
      )}
    </div>
  );
}