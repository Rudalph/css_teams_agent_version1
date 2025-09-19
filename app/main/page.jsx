"use client";
import { useState } from "react";

export default function MainPage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  let recognition;

  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleResponse(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }

  const startListening = () => {
    if (recognition) {
      setTranscript("");
      setResponse("");
      recognition.start();
      setListening(true);
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleResponse = (text) => {
    let reply = "Sorry, I didn’t get that.";

    if (text.toLowerCase().includes("hello")) {
      reply = "Hi!";
    } else if (text.toLowerCase().includes("how are you")) {
      reply = "I am good, thank you!";
    }

    setResponse(reply);
    speak(reply);
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    synth.speak(utter);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>🎤 Voice Assistant Demo</h1>
      <button
        onClick={startListening}
        disabled={listening}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#0070f3", color: "white", borderRadius: "8px", border: "none", cursor: "pointer" }}
      >
        {listening ? "Listening..." : "Start Talking"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <p><b>You said:</b> {transcript}</p>
        <p><b>Response:</b> {response}</p>
      </div>
    </div>
  );
}
