import { useCallback, useEffect, useRef, useState } from 'react';
import { requestSpeechToText } from '../api/ai';

const DEFAULT_MEDIA_CONSTRAINTS = { audio: true };

export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const supportsNativeSpeech = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startNativeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = (event) => {
      setError(event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(' ');
      setTranscript((prev) => `${prev} ${text}`.trim());
    };
    recognition.start();
    return recognition;
  }, []);

  const stopNativeRecognition = useCallback((recognition) => {
    recognition?.stop();
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    if (supportsNativeSpeech) {
      const recognition = startNativeRecognition();
      mediaRecorderRef.current = recognition;
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia(DEFAULT_MEDIA_CONSTRAINTS);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const { transcript: remoteTranscript } = await requestSpeechToText({
            audioContent: base64Data,
            config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 }
          });
          setTranscript((prev) => `${prev} ${remoteTranscript}`.trim());
        } catch (err) {
          setError(err.message);
        }
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [supportsNativeSpeech, startNativeRecognition]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (supportsNativeSpeech) {
      stopNativeRecognition(recorder);
    } else if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  }, [supportsNativeSpeech, stopNativeRecognition]);

  return {
    transcript,
    isRecording,
    error,
    startRecording,
    stopRecording,
    reset: () => setTranscript('')
  };
};
