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
 * Waveform Icon Component (for voice mode button)
 */
function WaveformIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="10" width="2" height="4" rx="1" />
      <rect x="8" y="7" width="2" height="10" rx="1" />
      <rect x="12" y="4" width="2" height="16" rx="1" />
      <rect x="16" y="7" width="2" height="10" rx="1" />
      <rect x="20" y="10" width="2" height="4" rx="1" />
    </svg>
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
 * ChatGPT-style input with text/voice modes
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
      
      let finalTranscript = '';
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onInputChange(finalTranscript + interimTranscript);
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

  // Handle key down
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
  const handleVoiceModeToggle = () => {
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

  // Icons
  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const MicMutedIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
      <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2"></line>
    </svg>
  );

  const SpeakerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  );

  const SpeakerMutedIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  );

  // Common wrapper
  return (
    <div className="chat-input-wrapper">
      {/* Plus button */}
      <button 
        className="input-icon-btn plus-btn"
        onClick={() => setShowFutureModal(true)}
        title="Add media"
      >
        <PlusIcon />
      </button>
      
      {/* Text input - always visible */}
      <input
        ref={inputRef}
        type="text"
        className="chat-text-input"
        placeholder={voiceMode ? "Type" : placeholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      
      {/* Right side controls depend on mode */}
      {voiceMode ? (
        // Voice mode: Speaker mute, Mic mute, End button
        <>
          <button 
            className={`input-icon-btn speaker-btn ${voice?.speakerMuted ? 'muted' : ''}`}
            onClick={() => voice?.toggleSpeaker()}
            title={voice?.speakerMuted ? 'Unmute speaker' : 'Mute speaker'}
          >
            {voice?.speakerMuted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
          </button>
          
          <button 
            className={`input-icon-btn mic-btn ${voice?.isMuted ? 'muted' : ''}`}
            onClick={() => voice?.toggleMute()}
            title={voice?.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {voice?.isMuted ? <MicMutedIcon /> : <MicIcon />}
          </button>
          
          <button 
            className="voice-end-btn"
            onClick={handleVoiceModeToggle}
            title="End voice mode"
          >
            <span className="voice-end-dots">
              <span></span><span></span><span></span>
            </span>
            <span className="voice-end-text">End</span>
          </button>
        </>
      ) : (
        // Text mode: Dictate mic, Voice mode button
        <>
          <button 
            className={`input-icon-btn dictate-btn ${isDictating ? 'active' : ''}`}
            onClick={toggleDictation}
            title="Dictate"
            disabled={!recognitionRef.current}
          >
            <MicIcon />
            {isDictating && <span className="dictate-pulse"></span>}
          </button>
          
          <button 
            className="voice-mode-btn"
            onClick={handleVoiceModeToggle}
            title="Use voice mode"
          >
            <WaveformIcon size={18} />
          </button>
        </>
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
    WaveformIcon,
    FutureFeatureModal,
    isTouchDevice
  };
}
