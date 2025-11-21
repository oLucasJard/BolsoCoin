'use client';

import { useState } from 'react';
import { processTextInput, processImageInput, createTransaction } from '@/lib/actions/transaction.actions';
import { toast } from 'sonner';
import { MessageSquare, Mic, Image as ImageIcon, Loader2, Check, X } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          ✨ Página Mágica
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione transações usando texto, áudio ou imagem
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'text'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <MessageSquare size={20} />
          <span>Texto</span>
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'audio'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Mic size={20} />
          <span>Áudio</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'image'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <ImageIcon size={20} />
          <span>Imagem</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Digite sua transação
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ex: Comprei um café no Starbucks por 15,50&#10;Ex: Gasolina 200 reais posto Shell&#10;Ex: Recebi 5000 do cliente X"
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                disabled={processing}
              />
            </div>
            <button
              type="submit"
              disabled={processing || !textInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processando...</span>
                </>
              ) : (
                <span>Extrair Transação</span>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">💡 Como usar:</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Envie uma foto do recibo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition inline-block">
                    Selecionar Imagem
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={processing}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG ou JPEG até 10MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Card */}
      {extractedData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-green-500">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Confirmar Transação
          </h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
              <span className={`font-medium ${extractedData.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {extractedData.type === 'income' ? 'Receita' : 'Despesa'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Valor:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                R$ {extractedData.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Descrição:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {extractedData.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Categoria:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {extractedData.categoryName}
              </span>
            </div>
            {extractedData.vendor && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fornecedor:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {extractedData.vendor}
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Check size={20} />
              <span>Confirmar</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <X size={20} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          💡 Exemplos de entrada:
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• "Comprei um café no Starbucks por 15,50"</li>
          <li>• "Gasolina 200 reais posto Shell"</li>
          <li>• "Recebi 5000 do cliente X"</li>
          <li>• "Almoço 45 reais restaurante italiano"</li>
          <li>• "Pagamento freelance 3000"</li>
        </ul>
      </div>
    </div>
  );
}

