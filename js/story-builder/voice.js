/* ========================================
   SOCIETY ARTS - VOICE INTEGRATION
   Hume EVI (Empathic Voice Interface)
   Version: 2.0
   ======================================== */

/**
 * Hume EVI React Hook
 */
function useHumeEVI({ onUserMessage, onAssistantMessage }) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const socketRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const audioQueueRef = React.useRef([]);
  const isPlayingRef = React.useRef(false);
  const streamRef = React.useRef(null);
  const currentAssistantMessageRef = React.useRef('');

  const { API } = window.SocietyArts;

  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    
    isPlayingRef.current = true;
    setIsSpeaking(true);

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      try {
        await playAudio(audioData);
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    }

    isPlayingRef.current = false;
    setIsSpeaking(false);
  };

  const playAudio = (base64Audio) => {
    return new Promise((resolve, reject) => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        audioContextRef.current.decodeAudioData(bytes.buffer, (buffer) => {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = resolve;
          source.start(0);
        }, reject);
      } catch (err) {
        reject(err);
      }
    });
  };

  const connect = async (configId = null) => {
    try {
      setError(null);
      const accessToken = await API.getHumeToken();
      
      let wsUrl = `wss://api.hume.ai/v0/evi/chat?access_token=${accessToken}`;
      if (configId) {
        wsUrl += `&config_id=${configId}`;
      }

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('Hume EVI connected');
        setIsConnected(true);
        
        socketRef.current.send(JSON.stringify({
          type: 'session_settings',
          system_prompt: API.prompts.voiceMode,
        }));
      };

      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'user_message':
            if (message.message?.content) {
              console.log('User said:', message.message.content);
              onUserMessage?.(message.message.content);
            }
            break;
            
          case 'assistant_message':
            if (message.message?.content) {
              console.log('Assistant said:', message.message.content);
              currentAssistantMessageRef.current = message.message.content;
            }
            break;
          
          case 'assistant_end':
            if (currentAssistantMessageRef.current) {
              onAssistantMessage?.(currentAssistantMessageRef.current);
              currentAssistantMessageRef.current = '';
            }
            break;
            
          case 'audio_output':
            if (message.data) {
              audioQueueRef.current.push(message.data);
              playAudioQueue();
            }
            break;
            
          case 'user_interruption':
            audioQueueRef.current = [];
            break;
            
          case 'error':
            console.error('Hume EVI error:', message);
            setError(message.message || 'An error occurred');
            break;
        }
      };

      socketRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
        setIsConnected(false);
      };

      socketRef.current.onclose = () => {
        console.log('Hume EVI disconnected');
        setIsConnected(false);
        setIsListening(false);
      };

    } catch (err) {
      console.error('Failed to connect to Hume EVI:', err);
      setError(err.message);
      throw err;
    }
  };

  const startListening = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            socketRef.current.send(JSON.stringify({
              type: 'audio_input',
              data: base64,
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorderRef.current.start(100);
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError('Microphone access denied');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  const disconnect = () => {
    stopListening();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    audioQueueRef.current = [];
    setIsConnected(false);
    setIsSpeaking(false);
  };

  React.useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isListening,
    isSpeaking,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
  };
}

/**
 * Voice Mode Indicator Component
 */
function VoiceModeIndicator({ isListening, isSpeaking, error, onExit }) {
  let statusText = '🎙️ Voice Mode (Hume EVI)';
  if (isListening) statusText = '🎤 Listening...';
  if (isSpeaking) statusText = '🔊 Speaking...';
  if (error) statusText = '❌ ' + error;

  return (
    <div className="voice-mode-indicator">
      <span className="voice-mode-text">{statusText}</span>
      <button className="btn btn-sm btn-secondary" onClick={onExit}>
        Exit Voice Mode
      </button>
    </div>
  );
}

/**
 * Microphone Button Component
 */
function MicButton({ voiceMode, isListening, isSpeaking, onClick, size = 'normal' }) {
  const getClassName = () => {
    let className = 'btn-mic';
    if (size === 'large') className += ' btn-circle-lg';
    if (isListening) className += ' listening';
    if (isSpeaking) className += ' speaking';
    if (voiceMode && !isListening && !isSpeaking) className += ' active';
    return className;
  };

  const getIcon = () => {
    if (isSpeaking) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    );
  };

  const title = voiceMode 
    ? (isListening ? "Listening..." : "Click to speak") 
    : "Enable voice mode";

  return (
    <button className={getClassName()} onClick={onClick} title={title}>
      {getIcon()}
    </button>
  );
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Voice = {
    useHumeEVI,
    VoiceModeIndicator,
    MicButton
  };
}
