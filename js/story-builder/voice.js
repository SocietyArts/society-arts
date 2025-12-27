/* ========================================
   SOCIETY ARTS - VOICE INTEGRATION
   Unified text/voice input system
   Version: 4.0 (v21)
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
  const [isMuted, setIsMuted] = React.useState(false);
  const [speakerMuted, setSpeakerMuted] = React.useState(false);
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
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || speakerMuted) return;
    
    isPlayingRef.current = true;
    setIsSpeaking(true);

    while (audioQueueRef.current.length > 0) {
      if (speakerMuted) {
        audioQueueRef.current = [];
        break;
      }
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
    return new Promise(async (resolve, reject) => {
      try {
        setError(null);
        console.log('Getting Hume token...');
        const accessToken = await API.getHumeToken();
        console.log('Token received, connecting to WebSocket...');
        
        let wsUrl = `wss://api.hume.ai/v0/evi/chat?access_token=${accessToken}`;
        if (configId) {
          wsUrl += `&config_id=${configId}`;
        }

        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
          console.log('WebSocket opened, sending session settings...');
          setIsConnected(true);
          
          socketRef.current.send(JSON.stringify({
            type: 'session_settings',
            system_prompt: API.prompts.voiceMode,
          }));
          
          console.log('Voice interface ready!');
          resolve();
        };

        socketRef.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('Received message type:', message.type);
          
          switch (message.type) {
            case 'user_message':
              if (message.message?.content) {
                console.log('User said:', message.message.content);
                onUserMessage?.(message.message.content);
              }
              break;
              
            case 'assistant_message':
              if (message.message?.content) {
                console.log('Assistant says:', message.message.content);
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
                console.log('Received audio chunk');
                audioQueueRef.current.push(message.data);
                if (!speakerMuted) {
                  playAudioQueue();
                }
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
          reject(err);
        };

        socketRef.current.onclose = () => {
          console.log('Voice interface disconnected');
          setIsConnected(false);
          setIsListening(false);
        };

      } catch (err) {
        console.error('Failed to connect voice interface:', err);
        setError(err.message);
        reject(err);
      }
    });
  };

  const startListening = async () => {
    console.log('startListening called');
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected, state:', socketRef.current?.readyState);
      return;
    }

    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      console.log('Microphone access granted');
      streamRef.current = stream;

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN && !isMuted) {
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
      console.log('Now listening!');
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

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleSpeaker = () => {
    setSpeakerMuted(prev => {
      if (!prev) {
        // Muting - clear queue
        audioQueueRef.current = [];
        setIsSpeaking(false);
      }
      return !prev;
    });
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
    isMuted,
    speakerMuted,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    toggleMute,
    toggleSpeaker,
  };
}

/**
 * Waveform Animation Component
 */
function Waveform({ active, speaking }) {
  const bars = 5;
  return (
    <div className={`waveform ${active ? 'active' : ''} ${speaking ? 'speaking' : ''}`}>
      {[...Array(bars)].map((_, i) => (
        <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
      ))}
    </div>
  );
}

/**
 * Future Feature Modal
 */
function FutureFeatureModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content future-modal" onClick={e => e.stopPropagation()}>
        <h3>Coming Soon</h3>
        <p>In a future edition, you'll be able to upload your own artwork and images to incorporate into your story.</p>
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

/**
 * Unified Input Component
 * Text mode with dictation, Voice mode with waveform and speaker control
 */
function UnifiedInput({ 
  voiceMode,
  onToggleMode,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  voice,
  placeholder = "Start your story...",
  onRequireAuth
}) {
  const inputRef = React.useRef(null);
  const [showFutureModal, setShowFutureModal] = React.useState(false);
  const [isDictating, setIsDictating] = React.useState(false);
  const recognitionRef = React.useRef(null);

  // Initialize speech recognition for dictation
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onInputChange(inputValue + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsDictating(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle key down in text mode
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send with auth check
  const handleSend = () => {
    if (onRequireAuth && !window.SocietyArts?.AuthState?.user) {
      onRequireAuth();
      return;
    }
    onSendMessage();
  };

  // Handle voice mode toggle with auth check
  const handleVoiceToggle = () => {
    if (onRequireAuth && !window.SocietyArts?.AuthState?.user) {
      onRequireAuth();
      return;
    }
    onToggleMode(!voiceMode);
  };

  // Toggle dictation in text mode
  const toggleDictation = () => {
    if (!recognitionRef.current) return;
    
    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      recognitionRef.current.start();
      setIsDictating(true);
    }
  };

  // Voice mode controls
  const handleMicToggle = () => {
    if (voice?.isMuted) {
      voice.toggleMute();
    } else {
      voice.toggleMute();
    }
  };

  // Icons
  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const MicIcon = ({ muted }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
      {muted && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"></line>}
    </svg>
  );

  const SpeakerIcon = ({ muted }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      {muted ? (
        <line x1="23" y1="9" x2="17" y2="15"></line>
      ) : (
        <>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </>
      )}
      {muted && <line x1="17" y1="9" x2="23" y2="15"></line>}
    </svg>
  );

  const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );

  const KeyboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
      <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"></path>
    </svg>
  );

  // Voice mode UI
  if (voiceMode) {
    return (
      <div className="voice-mode-input">
        {/* Speaker toggle (left) */}
        <button 
          className={`voice-control-btn speaker-btn ${voice?.speakerMuted ? 'muted' : ''}`}
          onClick={() => voice?.toggleSpeaker()}
          title={voice?.speakerMuted ? 'Unmute speaker' : 'Mute speaker'}
        >
          <SpeakerIcon muted={voice?.speakerMuted} />
        </button>
        
        {/* Central waveform area */}
        <div className="voice-waveform-area">
          <Waveform active={voice?.isListening} speaking={voice?.isSpeaking} />
          <span className="voice-status">
            {voice?.error ? voice.error :
             !voice?.isConnected ? 'Connecting...' :
             voice?.isSpeaking ? 'Speaking...' :
             voice?.isListening && !voice?.isMuted ? 'Listening...' :
             voice?.isMuted ? 'Mic muted' : 'Ready'}
          </span>
        </div>
        
        {/* Mic mute toggle (right) */}
        <button 
          className={`voice-control-btn mic-btn ${voice?.isMuted ? 'muted' : ''}`}
          onClick={() => voice?.toggleMute()}
          title={voice?.isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          <MicIcon muted={voice?.isMuted} />
        </button>
        
        {/* Text mode toggle */}
        <button 
          className="voice-control-btn text-mode-btn"
          onClick={handleVoiceToggle}
          title="Switch to text mode"
        >
          <KeyboardIcon />
        </button>
        
        <FutureFeatureModal 
          isOpen={showFutureModal} 
          onClose={() => setShowFutureModal(false)} 
        />
      </div>
    );
  }

  // Text mode UI
  return (
    <div className="text-mode-input">
      {/* Plus button for future feature */}
      <button 
        className="input-action-btn plus-btn"
        onClick={() => setShowFutureModal(true)}
        title="Add media"
      >
        <PlusIcon />
      </button>
      
      {/* Text input */}
      <div className="text-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="text-input-field"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
      
      {/* Dictation mic button */}
      <button 
        className={`input-action-btn dictate-btn ${isDictating ? 'active' : ''}`}
        onClick={toggleDictation}
        title="Dictate text"
        disabled={!recognitionRef.current}
      >
        <MicIcon muted={false} />
        {isDictating && <span className="dictate-pulse"></span>}
      </button>
      
      {/* Send or Voice toggle */}
      {inputValue.trim() ? (
        <button 
          className="input-action-btn send-btn"
          onClick={handleSend}
          disabled={isLoading}
          title="Send message"
        >
          <SendIcon />
        </button>
      ) : (
        <button 
          className="input-action-btn voice-mode-btn"
          onClick={handleVoiceToggle}
          title="Switch to voice mode"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
      )}
      
      <FutureFeatureModal 
        isOpen={showFutureModal} 
        onClose={() => setShowFutureModal(false)} 
      />
    </div>
  );
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Voice = {
    useVoiceInterface,
    UnifiedInput,
    Waveform,
    FutureFeatureModal,
    isTouchDevice
  };
}
