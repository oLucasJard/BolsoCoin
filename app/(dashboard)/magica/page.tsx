'use client';

import { useState, useRef } from 'react';
import { criar } from '@/lib/sheets/transacoes';
import { processTextInput, processImageInput } from '@/lib/sheets/ia';
import { toast } from 'sonner';
import { MessageSquare, Mic, Image as ImageIcon, Loader2, Check, X, Sparkles } from 'lucide-react';
import AudioRecorder from '@/components/AudioRecorder';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export default function MagicPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    amount: number;
    type: string;
    tipo: string;
    description: string;
    category: string;
    vendor: string;
    date: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setProcessing(true);
    try {
      const data = await processTextInput(textInput);
      setExtractedData(data);
      toast.success('Transação extraída! Confirme os dados.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar texto');
    } finally {
      setProcessing(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = () => reject(new Error('Erro ao ler imagem'));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Imagem muito grande. Máximo 10MB.');
      return;
    }
    setProcessing(true);
    try {
      const base64Data = await readFileAsBase64(file);
      const data = await processImageInput(base64Data);
      setExtractedData(data);
      toast.success('Recibo analisado! Confirme os dados.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar imagem');
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;
    if (!extractedData.description || extractedData.amount <= 0) {
      toast.error('Dados inválidos. Tente novamente.');
      return;
    }
    setProcessing(true);
    try {
      await criar({
        tipo: extractedData.tipo as 'receita' | 'despesa',
        descricao: extractedData.description,
        valor: extractedData.amount,
        categoria: extractedData.category || 'Outros',
        fornecedor: extractedData.vendor || '',
        data: extractedData.date,
        forma_pagamento: '',
        observacao: textInput || 'Entrada por IA',
        status: 'confirmada',
      });
      toast.success('Transação adicionada com sucesso!');
      setExtractedData(null);
      setTextInput('');
    } catch {
      toast.error('Erro ao salvar transação.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setTextInput('');
  };

  return (
    <div className="min-h-screen bg-c6-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-c6-yellow rounded-full mb-4">
            <Sparkles className="text-c6-black" size={28} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Entrada Mágica</h1>
          <p className="text-c6-gray-400 text-sm sm:text-base">Adicione transações de forma inteligente</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1 bg-c6-gray-900 rounded-c6">
          {([
            { key: 'text', icon: MessageSquare, label: 'Texto' },
            { key: 'audio', icon: Mic, label: 'Áudio' },
            { key: 'image', icon: ImageIcon, label: 'Imagem' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-4 rounded-c6-sm font-medium transition-all touch-manipulation ${
                activeTab === key
                  ? 'bg-c6-yellow text-c6-black shadow-c6-yellow'
                  : 'text-c6-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs sm:text-base">{label}</span>
            </button>
          ))}
        </div>

        <div className="card-c6 bg-c6-gray-900">
          {activeTab === 'text' && (
            <form ref={formRef} onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Digite sua transação</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ex: Comprei um café no Starbucks por 15,50"
                  className="input-c6 h-32 sm:h-40 resize-none"
                  disabled={processing}
                />
              </div>
              <button type="submit" disabled={processing || !textInput.trim()} className="btn-c6 w-full">
                {processing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processando...</span>
                  </span>
                ) : 'Extrair Transação'}
              </button>
            </form>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="py-8">
                <AudioRecorder
                  onTranscriptionComplete={(text) => {
                    setTextInput(text);
                    setActiveTab('text');
                    toast.success('Transcrição completa!');
                    setTimeout(() => formRef.current?.requestSubmit(), 100);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Envie uma foto do recibo</label>
                <div className="border-2 border-dashed border-c6-gray-700 rounded-c6 p-8 sm:p-12 text-center">
                  <ImageIcon size={48} className="mx-auto text-c6-gray-500 mb-4" />
                  <label className="cursor-pointer touch-manipulation">
                    <span className="btn-c6 inline-block">Selecionar Imagem</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" disabled={processing} />
                  </label>
                  <p className="mt-3 text-sm text-c6-gray-400">PNG, JPG ou JPEG até 10MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {extractedData && (
          <div className="card-c6 bg-c6-gray-900 border-2 border-c6-yellow">
            <h3 className="font-display text-xl font-semibold mb-4 text-c6-yellow">Confirmar Transação</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Tipo:</span>
                <span className={`font-semibold ${extractedData.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                  {extractedData.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Valor:</span>
                <span className="font-bold text-white text-lg">R$ {extractedData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Descrição:</span>
                <span className="font-medium text-white text-right max-w-[60%]">{extractedData.description}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-c6-gray-400">Categoria:</span>
                <span className="px-3 py-1 bg-c6-gray-800 rounded-full text-sm font-medium text-c6-yellow">{extractedData.category}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleConfirm} disabled={processing} className="btn-c6 flex-1">
                <Check size={20} className="inline mr-2" /> Confirmar
              </button>
              <button onClick={handleCancel} disabled={processing} className="btn-c6-outline flex-1">
                <X size={20} className="inline mr-2" /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
