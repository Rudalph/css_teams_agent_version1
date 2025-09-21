// "use client";
// import { useState } from "react";

// const page = () => {

//   const [text, setText] = useState("");
//   const [videoUrl, setVideoUrl] = useState(null);

//   const handleSpeak = async () => {
//     setVideoUrl(null); // reset previous video
//     const res = await fetch(`http://localhost:8000/speak/?text=${encodeURIComponent(text)}`, {
//       method: "POST",
//     });
//     const blob = await res.blob();
//     setVideoUrl(URL.createObjectURL(blob));
//   };

//  return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>🗣 Talking Avatar</h1>

//       <input
//         type="text"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type something..."
//         style={{ width: "300px", padding: "10px", margin: "10px" }}
//       />
//       <button onClick={handleSpeak} style={{ padding: "10px 20px" }}>
//         Speak
//       </button>

//       <div style={{
//     position: "relative",
//     width: "200px",    // width of the avatar image
//     height: "300px",   // height of the avatar image
//     margin: "20px auto",
//   }}>
//         {/* Static avatar image */}
//   <img
//     src="/avatar.jpg"
//     alt="Avatar"
//     style={{
//       width: "100%",   // make it fill parent div
//       height: "100%",
//       borderRadius: "10px",
//       display: "block",
//     }}/>

//         {/* Lip-synced video overlay */}
//   {videoUrl && (
//     <video
//       src={videoUrl}
//       autoPlay
//       muted={false}
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",   // match parent width
//         height: "100%",  // match parent height
//         borderRadius: "10px",
//         objectFit: "cover",  // ensures video covers exactly like image
//         pointerEvents: "none",
//       }}
//     />
//   )}
//       </div>
//     </div>
//   );

// }

// export default page
















"use client";
import { useState, useRef, useEffect } from "react";

const TalkingAvatar = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef(null);
  const avatarRef = useRef(null);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setError("Please enter some text to speak");
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`http://localhost:8000/speak/?text=${encodeURIComponent(text)}`, {
        method: "POST",
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }

    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Speech generation failed:", err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleVideoLoadedData = () => {
    if (videoRef.current && avatarRef.current) {
      // Hide static image and show video
      avatarRef.current.style.opacity = '0';
      videoRef.current.style.opacity = '1';
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current && avatarRef.current) {
      // Show static image and hide video
      videoRef.current.style.opacity = '0';
      avatarRef.current.style.opacity = '1';
      setIsPlaying(false);
      
      // Clean up video URL to free memory
      if (videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSpeak();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-4xl font-bold text-black mb-2">
            🎭 AI Avatar
          </h1>
        </div>

        {/* Avatar Container */}
        <div className="relative w-64 h-80 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl">
          {/* Static Avatar Image */}
          <img
            ref={avatarRef}
            src="/avatar.jpg"
            alt="Avatar"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: 1 }}
          />
          
          {/* Video Overlay */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: 0 }}
            onLoadedData={handleVideoLoadedData}
            onEnded={handleVideoEnded}
            playsInline
            muted={false}
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-black text-sm">Generating speech...</p>
                <div className="w-32 bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Speaking Indicator */}
          {isPlaying && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/10 border border-black/20 rounded-xl text-black placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              rows="2"
              maxLength="500"
            />
            <div className="absolute bottom-2 right-2 text-black/40 text-xs">
              {text.length}/500
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSpeak}
            disabled={isLoading || !text.trim()}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform ${
              isLoading || !text.trim()
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-black hover:scale-105 text-white active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🎤</span>
                <span>Make Avatar Speak</span>
              </div>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Actions */}
          {/* <div className="flex space-x-2">
            <button
              onClick={() => setText("Hello! I'm your AI avatar. How can I help you today?")}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-black/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm transition-all duration-200"
            >
              Demo Text
            </button>
            <button
              onClick={() => setText("")}
              disabled={isLoading}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm transition-all duration-200"
            >
              Clear
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default TalkingAvatar;