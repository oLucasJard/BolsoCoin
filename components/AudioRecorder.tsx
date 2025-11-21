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
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Gravação iniciada!');
    } catch (error) {
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro na transcrição');
      }

      const data = await response.json();
      onTranscriptionComplete(data.text);
    } catch (error) {
      toast.error('Erro ao transcrever áudio. Tente novamente.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {isProcessing ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-c6-yellow/20 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-c6-yellow" size={48} />
          </div>
          <p className="text-c6-gray-400">Transcrevendo áudio...</p>
        </div>
      ) : (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 touch-manipulation ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-c6-yellow hover:bg-c6-yellow-light shadow-c6-yellow'
            }`}
          >
            {isRecording ? (
              <Square className="text-white fill-white" size={32} />
            ) : (
              <Mic className="text-c6-black" size={32} />
            )}
          </button>

          <div className="text-center">
            {isRecording ? (
              <>
                <p className="text-lg font-semibold text-white mb-1">
                  🎙️ Gravando...
                </p>
                <p className="text-sm text-c6-gray-400">
                  Clique para parar
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-white mb-1">
                  Pronto para gravar
                </p>
                <p className="text-sm text-c6-gray-400">
                  Clique no microfone para começar
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
