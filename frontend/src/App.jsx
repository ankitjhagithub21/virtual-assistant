import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App = () => {


  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [result, setResult] = useState("");

  const handleSend = async () => {
    if(!transcript) return;
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api`, {
        query:transcript,
      });
      console.log(res);
      setResult(res.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.log(error);
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    const timerId = setTimeout(()=>{
      handleSend()
    },[2000])
    
    return ()=>{
       clearInterval(timerId)
    }
  }, [transcript]);

  return (
    <div className="p-5">


       <ReactMarkdown>
          {result}
        </ReactMarkdown>

      <p>Microphone: {listening ? "on" : "off"}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

    </div>
  );
};

export default App;
