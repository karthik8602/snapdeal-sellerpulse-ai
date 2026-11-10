import { useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const SELLER_ID = "SELLER001";

function VoiceAssistant() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  // Refs
  const recognitionRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const shouldSubmitRef = useRef(false);
  const hasProcessedResult = useRef(false);
  const silenceTimerRef = useRef(null);

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);

    silenceTimerRef.current = setTimeout(() => {
      console.log("6 seconds of silence. Finishing recording...");
      finishListening();
    }, 6000);
  };

  // Start voice recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported. Use Chrome or Edge.");
      return;
    }

    if (!API_URL) {
      setError("API URL is missing. Check your client/.env file.");
      return;
    }

    window.speechSynthesis?.cancel();

    setError("");
    setTranscript("");
    setResponse("");

    transcriptBufferRef.current = "";
    shouldSubmitRef.current = false;
    hasProcessedResult.current = false;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("listening");
    };

    // Collect speech without submitting immediately
    recognition.onresult = (event) => {
      let interimText = "";
      let speechDetected = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const spokenWords = event.results[i][0].transcript;

        if (spokenWords.trim()) {
          speechDetected = true;
        }

        if (event.results[i].isFinal) {
          transcriptBufferRef.current += spokenWords + " ";
        } else {
          interimText += spokenWords;
        }
      }

      setTranscript(transcriptBufferRef.current + interimText);

      // Reset timer only when actual speech is detected
      if (speechDetected) {
        resetSilenceTimer();
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(silenceTimerRef.current);
      console.log("Speech recognition error:", event.error);

      shouldSubmitRef.current = false;

      if (event.error === "no-speech") {
        setError("No speech detected. Microphone stopped.");
      } else if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
      } else {
        setError(`Microphone error: ${event.error}`);
      }

      setStatus("idle");
    };

    // Submit only after the user clicks Finish & Send
    recognition.onend = async () => {
      clearTimeout(silenceTimerRef.current);

      recognitionRef.current = null;

      if (!shouldSubmitRef.current || hasProcessedResult.current) {
        setStatus("idle");
        return;
      }

      hasProcessedResult.current = true;
      shouldSubmitRef.current = false;

      const spokenText = transcriptBufferRef.current.trim();

      if (!spokenText) {
        setStatus("idle");
        setError("No speech detected. Please try again.");
        return;
      }

      setTranscript(spokenText);
      setStatus("thinking");

      try {
        const result = await fetch(`${API_URL}/api/ai/consult/${SELLER_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: spokenText,
          }),
        });

        const responseText = await result.text();

        console.log("Backend HTTP status:", result.status);

        console.log("Backend raw response:", responseText);

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("Backend returned an invalid response.");
        }

        if (!result.ok || !data.success) {
          throw new Error(data.message || "Failed to get AI response.");
        }

        setResponse(data.response);

        speakResponse(data.response);
      } catch (err) {
        console.error("Voice assistant error:", err);

        setError(err.message || "Something went wrong.");

        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start recognition:", err);
      setError("Could not start microphone. Try again.");
      setStatus("idle");
      recognitionRef.current = null;
    }
  };

  // Finish recording and submit transcript
  const finishListening = () => {
    if (!recognitionRef.current) return;

    clearTimeout(silenceTimerRef.current);

    shouldSubmitRef.current = true;
    setStatus("thinking");

    recognitionRef.current.stop();
  };

  // Clean Markdown before converting response to speech

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, "")
      .replace(/\|/g, ", ")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      .replace(/₹/g, "rupees ")
      .replace(/%/g, " percent")
      .replace(/≈/g, "approximately ")
      .replace(/→/g, " to ")
      .replace(/↓/g, " decreased ")
      .replace(/↑/g, " increased ")
      .replace(/Δ/g, " change ")
      .replace(/&/g, " and ")
      .replace(/—|–|−/g, " ")
      .replace(/[\u2000-\u200F\u202F\u00A0]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Convert AI response into voice
  const speakResponse = (text) => {
    if (!window.speechSynthesis) {
      setError("Speech output is not supported.");
      setStatus("idle");
      return;
    }

    window.speechSynthesis.cancel();

    window.speechSynthesis.resume();

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);

    const cleanText = cleanTextForSpeech(text)
      .replace(/[|*_#~`]/g, "")
      .replace(/[-]{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setStatus("speaking");
    };

    utterance.onend = () => {
      setStatus("idle");
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setError(`Speech error: ${event.error}`);
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop recording or speech playback
  const stopAssistant = () => {
    clearTimeout(silenceTimerRef.current);
    shouldSubmitRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    window.speechSynthesis?.cancel();

    setStatus("idle");
  };

  return (
    <div className="voice-assistant">
      <h2>SellerPulse AI</h2>

      <p>Your AI-powered Virtual Key Account Manager</p>

      <div className="voice-status">
        {status === "idle" && "Ready to help"}

        {status === "listening" && "Listening..."}

        {status === "thinking" && "Analysing your business..."}

        {status === "speaking" && "Speaking..."}
      </div>

      <button onClick={startListening} disabled={status !== "idle"}>
        Start Speaking
      </button>

      {status === "listening" && (
        <button onClick={finishListening}>Finish & Send</button>
      )}

      {(status === "thinking" || status === "speaking") && (
        <button onClick={stopAssistant}>Stop</button>
      )}

      {transcript && (
        <div>
          <h3>You said</h3>
          <p>{transcript}</p>
        </div>
      )}

      {response && (
        <div>
          <h3>AI Response</h3>
          <p>{response}</p>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default VoiceAssistant;
