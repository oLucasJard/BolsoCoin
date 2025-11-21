'use client';

import { useState } from 'react';
import { processTextInput, processImageInput, createTransaction } from '@/lib/actions/transaction.actions';
import { toast } from 'sonner';
import { MessageSquare, Mic, Image as ImageIcon, Loader2, Check, X, Sparkles } from 'lucide-react';
import AudioRecorder from '@/components/AudioRecorder';

type ExtractedData = {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  categoryName: string;
  vendor?: string;
  date: Date;
  rawInput?: string;
};

export default function MagicPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setProcessing(true);
    try {
      const data = await processTextInput(textInput);
      setExtractedData(data);
      toast.success('Transação extraída! Confirme os dados.');
    } catch (error) {
      toast.error('Erro ao processar texto. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        const data = await processImageInput(base64Data);
        setExtractedData(data);
        toast.success('Recibo analisado! Confirme os dados.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;

    setProcessing(true);
    try {
      await createTransaction({
        ...extractedData,
        source: 'web',
      });
      toast.success('Transação adicionada com sucesso!');
      setExtractedData(null);
      setTextInput('');
    } catch (error) {
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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-c6-yellow rounded-full mb-4">
            <Sparkles className="text-c6-black" size={28} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Página Mágica
          </h1>
          <p className="text-c6-gray-400 text-sm sm:text-base">
            Adicione transações usando texto, áudio ou imagem
          </p>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1 bg-c6-gray-900 rounded-c6">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-4 rounded-c6-sm font-medium transition-all touch-manipulation ${
              activeTab === 'text'
                ? 'bg-c6-yellow text-c6-black shadow-c6-yellow'
                : 'text-c6-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-xs sm:text-base">Texto</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-4 rounded-c6-sm font-medium transition-all touch-manipulation ${
              activeTab === 'audio'
                ? 'bg-c6-yellow text-c6-black shadow-c6-yellow'
                : 'text-c6-gray-400 hover:text-white'
            }`}
          >
            <Mic size={20} />
            <span className="text-xs sm:text-base">Áudio</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-4 rounded-c6-sm font-medium transition-all touch-manipulation ${
              activeTab === 'image'
                ? 'bg-c6-yellow text-c6-black shadow-c6-yellow'
                : 'text-c6-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={20} />
            <span className="text-xs sm:text-base">Imagem</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="card-c6 bg-c6-gray-900">
          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">
                  Digite sua transação
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ex: Comprei um café no Starbucks por 15,50
Ex: Gasolina 200 reais posto Shell
Ex: Recebi 5000 do cliente X"
                  className="input-c6 h-32 sm:h-40 resize-none"
                  disabled={processing}
                />
              </div>
              <button
                type="submit"
                disabled={processing || !textInput.trim()}
                className="btn-c6 w-full"
              >
                {processing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processando...</span>
                  </span>
                ) : (
                  'Extrair Transação'
                )}
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
                    toast.success('Transcrição completa! Confirme os dados.');
                    // Auto-processar o texto
                    handleTextSubmit(new Event('submit') as any);
                  }}
                />
              </div>
              <div className="bg-c6-gray-800 rounded-c6-sm p-4 text-sm text-c6-gray-300 border border-c6-gray-700">
                <p className="font-semibold mb-2 text-c6-yellow">💡 Como usar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Clique no botão do microfone</li>
                  <li>Permita o acesso ao microfone</li>
                  <li>Fale sua transação naturalmente</li>
                  <li>Clique novamente para parar</li>
                  <li>Aguarde a transcrição e confirmação</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">
                  Envie uma foto do recibo
                </label>
                <div className="border-2 border-dashed border-c6-gray-700 rounded-c6 p-8 sm:p-12 text-center">
                  <ImageIcon size={48} className="mx-auto text-c6-gray-500 mb-4" />
                  <label className="cursor-pointer touch-manipulation">
                    <span className="btn-c6 inline-block">
                      Selecionar Imagem
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={processing}
                    />
                  </label>
                  <p className="mt-3 text-sm text-c6-gray-400">
                    PNG, JPG ou JPEG até 10MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Card */}
        {extractedData && (
          <div className="card-c6 bg-c6-gray-900 border-2 border-c6-yellow animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-display text-xl font-semibold mb-4 text-c6-yellow">
              Confirmar Transação
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Tipo:</span>
                <span className={`font-semibold ${extractedData.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {extractedData.type === 'income' ? '↗️ Receita' : '↘️ Despesa'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Valor:</span>
                <span className="font-bold text-white text-lg">
                  R$ {extractedData.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Descrição:</span>
                <span className="font-medium text-white text-right max-w-[60%]">
                  {extractedData.description}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                <span className="text-c6-gray-400">Categoria:</span>
                <span className="px-3 py-1 bg-c6-gray-800 rounded-full text-sm font-medium text-c6-yellow">
                  {extractedData.categoryName}
                </span>
              </div>
              {extractedData.vendor && (
                <div className="flex justify-between items-center py-2 border-b border-c6-gray-800">
                  <span className="text-c6-gray-400">Fornecedor:</span>
                  <span className="font-medium text-white">
                    {extractedData.vendor}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="btn-c6 flex-1"
              >
                <Check size={20} className="inline mr-2" />
                Confirmar
              </button>
              <button
                onClick={handleCancel}
                disabled={processing}
                className="btn-c6-outline flex-1"
              >
                <X size={20} className="inline mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="card-c6 bg-c6-gray-900 border border-c6-gray-800">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Exemplos de entrada:
          </h3>
          <ul className="space-y-2 text-sm text-c6-gray-400">
            <li className="flex items-start">
              <span className="text-c6-yellow mr-2">•</span>
              <span>&quot;Comprei um café no Starbucks por 15,50&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-c6-yellow mr-2">•</span>
              <span>&quot;Gasolina 200 reais posto Shell&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-c6-yellow mr-2">•</span>
              <span>&quot;Recebi 5000 do cliente X&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-c6-yellow mr-2">•</span>
              <span>&quot;Almoço 45 reais restaurante italiano&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-c6-yellow mr-2">•</span>
              <span>&quot;Pagamento freelance 3000&quot;</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
