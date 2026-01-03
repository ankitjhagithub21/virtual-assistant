import { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeechSynthesis } from "react-speech-kit";

const App = () => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const { speak, voices } = useSpeechSynthesis();

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Speak text
  const speakText = (text) => {
    if (!text) return;
  
    speak({ text, voice: voices.find(v => v.lang.includes("en") )});
  };

  // Send transcript to backend
  const sendQuery = async (text) => {
    if (!text) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api`, {
        query: text,
      });

      const aiText = res.data

      if (!aiText) throw new Error("No AI response");

      setAnswer(aiText);
      speakText(aiText);
    } catch (err) {
      setError("Something went wrong");
      speakText("Something went wrong");
    } finally {
      setLoading(false);
      resetTranscript();
    }
  };

  // Auto send after user stops speaking
  useEffect(() => {
    if (!transcript || loading) return;

    const timer = setTimeout(() => {
      sendQuery(transcript);
    }, 1500);

    return () => clearTimeout(timer);
  }, [transcript]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            AI Voice Assistant
          </h1>
          <p className="text-gray-400 text-sm">
            Tap the mic and start speaking
          </p>
        </div>

        {/* Voice Orb */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Pulse Rings */}
            {listening && (
              <>
                <div className="absolute inset-0 w-44 h-44 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 animate-ping"></div>
                <div
                  className="absolute inset-0 w-44 h-44 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </>
            )}

            {loading && (
              <div className="absolute inset-0 w-44 h-44 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin"></div>
            )}

            {/* Main Orb */}
            <div
              className={`
                w-44 h-44 rounded-full flex items-center justify-center
                transition-all duration-500 shadow-2xl
                ${
                  listening
                    ? "bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-purple-500/50"
                    : loading
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/50"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 shadow-gray-900/50"
                }
              `}
            >
              {/* Inner Circle */}
              <div
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center
                  bg-gradient-to-br from-slate-800 to-slate-900
                  ${listening ? "shadow-inner shadow-purple-500/30" : ""}
                `}
              >
                <span className="text-5xl">
                  {loading ? "🧠" : listening ? "🎤" : "🤖"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div
            className={`
              px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
              ${
                listening
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : loading
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }
            `}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                listening
                  ? "bg-green-400 animate-pulse"
                  : loading
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></span>
            {listening ? "Listening..." : loading ? "Thinking..." : "Ready"}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => SpeechRecognition.startListening()}
            className={`
              group relative px-8 py-4 rounded-2xl font-semibold text-white
              transition-all duration-300 overflow-hidden
              ${
                listening
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
              }
            `}
            disabled={listening}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">🎤</span> Start
            </span>
            {!listening && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>

          <button
            onClick={SpeechRecognition.stopListening}
            className={`
              px-8 py-4 rounded-2xl font-semibold transition-all duration-300
              ${
                !listening
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
              }
            `}
            disabled={!listening}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">⏹</span> Stop
            </span>
          </button>
        </div>

        {/* Transcript Card */}
        {transcript && (
          <div className="mb-4 p-5 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="text-xs text-cyan-400 font-medium mb-1">You</p>
                <p className="text-white text-lg">{transcript}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 p-5 bg-yellow-500/10 backdrop-blur-lg rounded-2xl border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-yellow-400 text-sm">AI is thinking...</p>
            </div>
          </div>
        )}

        {/* Answer Card */}
        {answer && (
          <div className="mb-4 p-5 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-purple-400 font-medium mb-1">
                  AI Assistant
                </p>
                <p className="text-white text-lg leading-relaxed">{answer}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="mb-4 p-5 bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/30 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-xs">
          <p>Powered by AI • Speak naturally in any language</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;