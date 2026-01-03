import { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App = () => {
  const { transcript, listening, resetTranscript } =
    useSpeechRecognition();

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Speak text
  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
  };

  // Send transcript to backend
  const sendQuery = async (text) => {
    if (!text) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api`,
        { query: text }
      );

      console.log(res.data)

      const aiText = res.data?.text;



      if (!aiText) throw new Error("No AI response");

      setAnswer(aiText);
      speak(aiText);
    } catch (err) {
      setError("Something went wrong");
      speak("Something went wrong");
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
    <div style={{ padding: 40 }}>
      <h1>AI Voice Assistant</h1>

      <button onClick={() => SpeechRecognition.startListening()}>
        🎤 Start
      </button>

      <button onClick={SpeechRecognition.stopListening}>
        ⏹ Stop
      </button>

      <p><b>Listening:</b> {listening ? "Yes" : "No"}</p>
      <p><b>You:</b> {transcript}</p>

      {loading && <p>Thinking...</p>}
      {answer && <p><b>AI:</b> {answer}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;
