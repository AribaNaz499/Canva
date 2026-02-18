
import React, { useContext, useRef, useEffect } from "react";
import { CanvasProvider, CanvasContext } from "./context/CanvasContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ToolPanel from "./components/ToolPanel";
import CanvasArea from "./components/CanvasArea";
import TemplateGallery from "./components/TemplateGallery";
import LayerPannel from "./components/LayerPannel";

const AppContent = () => {
  const { 
    currentView, 
    setElements, 
    setAudioFile, 
    setCanvasBg, 
    setCurrentDesignId,
    setCurrentView,
    audioFile,
    isPlaying,
    setIsPlaying
  } = useContext(CanvasContext);

  const audioTagRef = useRef(null);

  useEffect(() => {
    if (audioTagRef.current) {
      if (isPlaying) {
        audioTagRef.current.play().catch(err => console.log("Playback blocked:", err));
      } else {
        audioTagRef.current.pause();
      }
    }
  }, [isPlaying, audioFile]);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {currentView === "editor" ? (
          <>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <ToolPanel />
              <div className="flex-1 overflow-auto bg-gray-100 relative">
                {/* SIRF CanvasArea - yeh sab kuch handle karega */}
                <CanvasArea />
                <LayerPannel />
              </div>
            </div>
          </>
        ) : (
          <TemplateGallery 
            onEdit={(design) => {
              setElements(design.content.elements || []);
              setAudioFile(design.content.audioFile || null);
              setCanvasBg(design.content.canvasBg || "#ffffff");
              setCurrentDesignId(design.id);
              setCurrentView("editor");
            }} 
          />
        )}

    
        {audioFile && (
          <audio 
            ref={audioTagRef}
            src={audioFile.url} 
            onEnded={() => setIsPlaying(false)} 
            loop
          />
        )}
      </div>
    </div>
  );
};

const App = () => (
  <CanvasProvider>
    <AppContent />
  </CanvasProvider>
);

export default App;