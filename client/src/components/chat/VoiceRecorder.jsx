// components/chat/VoiceRecorder.jsx - Voice message recording component
import { useState, useRef, useEffect } from 'react';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi';
import WaveSurfer from 'wavesurfer.js';
import toast from 'react-hot-toast';
import api from '../../api';

const VoiceRecorder = ({ onSend, onTranscribe, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wavesurferRef.current) wavesurferRef.current.destroy();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Initialize wavesurfer after timeout to ensure DOM is ready
        setTimeout(() => {
          if (waveformRef.current) {
            wavesurferRef.current = WaveSurfer.create({
              container: waveformRef.current,
              waveColor: 'rgba(0, 212, 255, 0.4)',
              progressColor: '#00d4ff',
              cursorColor: 'transparent',
              barWidth: 2,
              barGap: 1,
              barRadius: 2,
              height: 30,
            });
            wavesurferRef.current.load(url);
          }
        }, 100);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    onSend(audioBlob);
  };

  const handleTranscribe = async () => {
    if (audioChunksRef.current.length === 0) return;
    setIsTranscribing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      const token = localStorage.getItem('nexus_token');
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/ai/transcribe` : '/api/ai/transcribe';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.text && onTranscribe) {
        onTranscribe(data.text);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      toast.error('Transcription failed. Ensure the AI service is ready.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 24, border: '1px solid var(--neon-blue)' }}>
      {/* Delete / Cancel Button */}
      <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
        <HiOutlineTrash size={20} />
      </button>

      {/* Center Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {audioUrl ? (
          <div ref={waveformRef} style={{ width: '100%', maxWidth: 200, cursor: 'pointer' }} onClick={() => wavesurferRef.current?.playPause()} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--neon-blue)', fontWeight: 600 }}>
            {isRecording ? (
              <div className="pulse-neon" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-blue)' }}></div>
            ) : null}
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {!audioUrl ? (
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            style={{ 
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 212, 255, 0.2)',
              color: isRecording ? '#ef4444' : 'var(--neon-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isRecording ? <HiOutlineStop size={20} /> : <HiOutlineMicrophone size={20} />}
          </button>
        ) : (
          <>
            <button 
              onClick={handleTranscribe}
              disabled={isTranscribing}
              style={{ 
                height: 36, padding: '0 16px', borderRadius: 18, border: 'none',
                background: isTranscribing ? 'var(--bg-tertiary)' : 'var(--accent-gradient)', 
                color: isTranscribing ? 'var(--text-muted)' : '#ffffff', 
                cursor: isTranscribing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600
              }}
              className={isTranscribing ? "" : "glass-hover"}
            >
              <HiOutlineDocumentText size={18} /> 
              {isTranscribing ? 'Transcribing...' : 'To Text'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
