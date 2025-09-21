// "use client";

// import React, { useState } from "react";

// export default function SpeechInput({ vrmRef }) {
//     const [text, setText] = useState("");

//     const handleSubmit = async () => {
//         if (!text.trim()) return;

//         try {
//             const res = await fetch("http://localhost:5000/ask", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//     },
//     body: JSON.stringify({ question: text }), 
// });

// const data = await res.json();
// const responseText = data.answer;  // Flask returns { "answer": "..." }
// handleSpeak(responseText);

//         } catch (err) {
//             console.error("Error talking to Flask:", err);
//         }
//     };

//     const handleSpeak = (message) => {
//         if (!vrmRef.current) return;
//         const vrm = vrmRef.current;

//         const utterance = new SpeechSynthesisUtterance(message);
//         utterance.rate = 1;
//         utterance.pitch = 1;

//         // Select female voice
//         const voices = window.speechSynthesis.getVoices();
//         const femaleVoices = voices.filter(voice =>
//             voice.name.toLowerCase().includes("zira") || 
//             voice.name.toLowerCase().includes("samantha")
//         );
//         if (femaleVoices.length > 0) utterance.voice = femaleVoices[0];

//         utterance.onstart = () => {
//             const visemes = ["A", "I", "U", "E", "O"];
//             const interval = setInterval(() => {
//                 if (!vrm) return clearInterval(interval);
//                 const viseme = visemes[Math.floor(Math.random() * visemes.length)];
//                 visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
//                 vrm.blendShapeProxy.setValue(viseme, 1);
//                 vrm.blendShapeProxy.update();
//             }, 120);

//             utterance.onend = () => {
//                 visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
//                 vrm.blendShapeProxy.update();
//                 clearInterval(interval);
//             };
//         };

//         speechSynthesis.speak(utterance);
//     };

//     return (
//         <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
//             <input
//                 type="text"
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Ask something..."
//                 style={{ width: "300px", padding: "8px", fontSize: "16px" }}
//             />
//             <button
//                 onClick={handleSubmit}
//                 style={{ marginLeft: "10px", padding: "8px 16px", fontSize: "16px" }}
//             >
//                 Ask
//             </button>
//         </div>
//     );
// }


"use client";

import React, { useEffect, useRef, useState } from "react";

export default function SpeechInput({ vrmRef }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("SpeechRecognition is not supported in this browser. Use Chrome.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Heard:", transcript);
            handleSubmit(transcript);

            // Check for wake word
            if (transcript.startsWith("agent")) {
                const question = transcript.replace("agent", "").trim();
                console.log(question.length)
                if (question.length > 0) {
                    console.log("Final Question:", question);
                    handleSubmit(question);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
            console.log("Recognition stopped, restarting...");
            recognition.start(); // Keep it always listening
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);

        return () => recognition.stop();
    }, []);

    const handleSubmit = async (question) => {
        if (!question) return;

        try {
            const res = await fetch("http://127.0.0.1:5000/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();
            const responseText = data.answer;
            handleSpeak(responseText);
        } catch (err) {
            console.error("Error talking to Flask:", err);
            handleSpeak("Sorry, I couldn’t connect to the server.");
        }
    };

    const handleSpeak = (message) => {
        if (!vrmRef.current) return;
        const vrm = vrmRef.current;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1;
        utterance.pitch = 1;

        // Select female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoices = voices.filter(voice =>
            voice.name.toLowerCase().includes("zira") || 
            voice.name.toLowerCase().includes("samantha")
        );
        if (femaleVoices.length > 0) utterance.voice = femaleVoices[0];

        utterance.onstart = () => {
            const visemes = ["A", "I", "U", "E", "O"];
            const interval = setInterval(() => {
                if (!vrm) return clearInterval(interval);
                const viseme = visemes[Math.floor(Math.random() * visemes.length)];
                visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
                vrm.blendShapeProxy.setValue(viseme, 1);
                vrm.blendShapeProxy.update();
            }, 120);

            utterance.onend = () => {
                visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
                vrm.blendShapeProxy.update();
                clearInterval(interval);
            };
        };

        speechSynthesis.speak(utterance);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>🎤 Listening for "Hey Kiyana"... ({isListening ? "Active" : "Inactive"})</p>
        </div>
    );
}

// "use client";

// import React, { useEffect, useRef, useState } from "react";

// export default function SpeechInput({ vrmRef }) {
//     const [isListening, setIsListening] = useState(false);
//     const [wakeMode, setWakeMode] = useState(false);
//     const recognitionRef = useRef(null);

//     useEffect(() => {
//         if (!("webkitSpeechRecognition" in window)) {
//             alert("SpeechRecognition is not supported in this browser. Use Chrome.");
//             return;
//         }

//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//         const recognition = new SpeechRecognition();

//         recognition.continuous = true;
//         recognition.interimResults = false;
//         recognition.lang = "en-US";

//         recognition.onresult = (event) => {
//             const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//             console.log("Heard:", transcript);

//             if (transcript.includes("hey kiyana")) {
//                 console.log("Wake word detected!");
//                 setWakeMode(true);
//                 return;
//             }

//             if (wakeMode) {
//                 console.log("Final Question:", transcript);
//                 setWakeMode(false);
//                 handleSubmit(transcript);
//             }
//         };

//         recognition.onerror = (event) => {
//             console.error("Speech recognition error:", event.error);
//         };

//         recognition.onend = () => {
//             console.log("Recognition stopped, restarting...");
//             recognition.start(); // restart automatically
//         };

//         recognition.start();
//         recognitionRef.current = recognition;
//         setIsListening(true);

//         return () => recognition.stop();
//     }, [wakeMode]);

//     const handleSubmit = async (question) => {
//         if (!question) return;

//         try {
//             const res = await fetch("http://localhost:5000/ask", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Accept": "application/json",
//                 },
//                 body: JSON.stringify({ question }),
//             });

//             if (!res.ok) {
//                 console.error("Flask error:", res.status);
//                 handleSpeak("Sorry, I had trouble reaching the server.");
//                 return;
//             }

//             const data = await res.json();
//             const responseText = data.answer;
//             handleSpeak(responseText);
//         } catch (err) {
//             console.error("Error talking to Flask:", err);
//             handleSpeak("Sorry, I couldn’t connect to the server.");
//         }
//     };

//     const handleSpeak = (message) => {
//         if (!vrmRef.current) return;
//         const vrm = vrmRef.current;

//         const utterance = new SpeechSynthesisUtterance(message);
//         utterance.rate = 1;
//         utterance.pitch = 1;

//         // Select female voice
//         const voices = window.speechSynthesis.getVoices();
//         const femaleVoices = voices.filter(voice =>
//             voice.name.toLowerCase().includes("zira") ||
//             voice.name.toLowerCase().includes("samantha")
//         );
//         if (femaleVoices.length > 0) utterance.voice = femaleVoices[0];

//         utterance.onstart = () => {
//             const visemes = ["A", "I", "U", "E", "O"];
//             const interval = setInterval(() => {
//                 if (!vrm) return clearInterval(interval);
//                 const viseme = visemes[Math.floor(Math.random() * visemes.length)];
//                 visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
//                 vrm.blendShapeProxy.setValue(viseme, 1);
//                 vrm.blendShapeProxy.update();
//             }, 120);

//             utterance.onend = () => {
//                 visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
//                 vrm.blendShapeProxy.update();
//                 clearInterval(interval);
//             };
//         };

//         speechSynthesis.speak(utterance);
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <p>🎤 Listening for "Hey Kiyana"... ({isListening ? "Active" : "Inactive"})</p>
//         </div>
//     );
// }

