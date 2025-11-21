'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Gravando... Fale agora!');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Converter para formato que a API aceita
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao transcrever áudio');
      }

      const { text } = await response.json();
      
      if (text && text.trim()) {
        onTranscriptionComplete(text.trim());
        toast.success('Áudio transcrito com sucesso!');
      } else {
        toast.error('Não foi possível entender o áudio. Tente novamente.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Erro ao processar áudio. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isRecording && !isProcessing && (
        <button
          onClick={startRecording}
          className="w-32 h-32 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
        >
          <Mic size={48} />
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all animate-pulse shadow-lg"
        >
          <Square size={48} />
        </button>
      )}

      {isProcessing && (
        <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
          <Loader2 size={48} className="animate-spin" />
        </div>
      )}

      <div className="text-center">
        {!isRecording && !isProcessing && (
          <p className="text-gray-600 dark:text-gray-400">
            Clique para começar a gravar
          </p>
        )}
        {isRecording && (
          <p className="text-red-600 dark:text-red-400 font-semibold">
            🔴 Gravando... Clique para parar
          </p>
        )}
        {isProcessing && (
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            Processando áudio...
          </p>
        )}
      </div>
    </div>
  );
}

