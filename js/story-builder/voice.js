/* ========================================
   SOCIETY ARTS - VOICE INTEGRATION
   Unified text/voice input system
   Version: 3.0
   ======================================== */

/**
 * Detect if user is on a touch device
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Voice Interface Hook
 */
function useVoiceInterface({ onUserMessage, onAssistantMessage }) {
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
        console.log('Voice interface connected');
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
              onUserMessage?.(message.message.content);
            }
            break;
            
          case 'assistant_message':
            if (message.message?.content) {
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
            console.error('Voice interface error:', message);
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
        console.log('Voice interface disconnected');
        setIsConnected(false);
        setIsListening(false);
      };

    } catch (err) {
      console.error('Failed to connect voice interface:', err);
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
 * Unified Input Component
 * Transforms between text and voice modes
 */
function UnifiedInput({ 
  voiceMode,
  onToggleMode,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  voice, // { isConnected, isListening, isSpeaking, error, startListening, stopListening }
  placeholder = "Start your story..."
}) {
  const isTouch = React.useMemo(() => isTouchDevice(), []);
  const inputRef = React.useRef(null);
  const holdTimeoutRef = React.useRef(null);
  const isHoldingRef = React.useRef(false);

  // Handle key down in text mode
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Toggle to voice mode
  const handleSwitchToVoice = () => {
    // Send any pending text first
    if (inputValue.trim()) {
      onSendMessage();
    }
    onToggleMode(true);
  };

  // Toggle to text mode
  const handleSwitchToText = () => {
    if (voice?.isListening) {
      voice.stopListening();
    }
    onToggleMode(false);
  };

  // Desktop: Press and hold to talk
  const handleMicMouseDown = (e) => {
    if (isTouch) return; // Let touch handlers deal with touch devices
    e.preventDefault();
    
    if (!voice?.isConnected) return;
    
    isHoldingRef.current = true;
    voice.startListening();
  };

  const handleMicMouseUp = (e) => {
    if (isTouch) return;
    e.preventDefault();
    
    if (isHoldingRef.current && voice?.stopListening) {
      isHoldingRef.current = false;
      voice.stopListening();
    }
  };

  const handleMicMouseLeave = (e) => {
    if (isTouch) return;
    
    if (isHoldingRef.current && voice?.stopListening) {
      isHoldingRef.current = false;
      voice.stopListening();
    }
  };

  // Mobile/Touch: Tap to toggle
  const handleMicTouchStart = (e) => {
    e.preventDefault();
    
    if (!voice?.isConnected) return;
    
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  // Get status text for voice mode
  const getVoiceStatus = () => {
    if (!voice) return 'Connecting...';
    if (voice.error) return voice.error;
    if (!voice.isConnected) return 'Connecting...';
    if (voice.isSpeaking) return 'Speaking...';
    if (voice.isListening) return isTouch ? 'Tap to stop' : 'Release to send';
    return isTouch ? 'Tap to speak' : 'Hold to speak';
  };

  // Early return if voice not ready
  const isVoiceReady = voice && voice.isConnected !== undefined;

  // Icons
  const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const TextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
  );

  const PencilIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89F94" strokeWidth="1.5">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );

  const SpeakerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  );

  // TEXT MODE
  if (!voiceMode) {
    return (
      <div className="unified-input unified-input-text">
        <div className="unified-input-inner">
          <PencilIcon />
          <input
            ref={inputRef}
            type="text"
            className="unified-input-field"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button 
            className="unified-mode-toggle"
            onClick={handleSwitchToVoice}
            title="Switch to voice mode"
            disabled={isLoading}
          >
            <MicIcon />
          </button>
        </div>
      </div>
    );
  }

  // VOICE MODE
  return (
    <div className={`unified-input unified-input-voice ${voice?.isListening ? 'listening' : ''} ${voice?.isSpeaking ? 'speaking' : ''}`}>
      <div className="unified-voice-content">
        {/* Pulsing ring when listening */}
        {voice?.isListening && (
          <div className="voice-pulse-ring"></div>
        )}
        
        {/* Main mic button */}
        <button
          className={`unified-mic-button ${voice?.isListening ? 'active' : ''} ${voice?.isSpeaking ? 'speaking' : ''}`}
          onMouseDown={handleMicMouseDown}
          onMouseUp={handleMicMouseUp}
          onMouseLeave={handleMicMouseLeave}
          onTouchStart={handleMicTouchStart}
          disabled={!voice?.isConnected || voice?.isSpeaking}
        >
          {voice?.isSpeaking ? <SpeakerIcon /> : <MicIcon />}
        </button>
        
        {/* Status text */}
        <span className="unified-voice-status">{getVoiceStatus()}</span>
      </div>
      
      {/* Switch to text mode */}
      <button 
        className="unified-mode-toggle unified-mode-toggle-text"
        onClick={handleSwitchToText}
        title="Switch to text mode"
      >
        <TextIcon />
      </button>
    </div>
  );
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Voice = {
    useVoiceInterface,
    UnifiedInput,
    isTouchDevice
  };
}
