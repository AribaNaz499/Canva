
import React, { useContext, useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";
import { CanvasContext } from '../context/CanvasContext';
import CanvasAudioPlayer from "../canvas/CanvasAudioPlayer";
import useImage from 'use-image';

const ImageElement = ({ element, isSelected, onSelect, onTransform }) => {
  const [image] = useImage(element.src);
  const shapeRef = useRef();
  
  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.x(element.x);
      shapeRef.current.y(element.y);
      shapeRef.current.width(element.width);
      shapeRef.current.height(element.height);
      shapeRef.current.rotation(element.rotation || 0);
    }
  }, [element]);

  return (
    <KonvaImage
      ref={shapeRef}
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onTransform({
          ...element,
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        node.scaleX(1);
        node.scaleY(1);
        
        onTransform({
          ...element,
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
          rotation: node.rotation()
        });
      }}
    />
  );
};

const CanvasArea = () => {
  const { 
    elements, 
    selectedId, 
    setSelectedId,
    audioFile,
    isPlaying,
    setIsPlaying,
    setAudioFile,
    canvasBg,
    setElements,
    orientation,
    stageRef  
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const trRef = useRef(null);

  
  const canvasDimensions = {
    portrait: { width: 400, height: 500 },
    landscape: { width: 500, height: 350 }
  };

  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        console.log("Attaching transformer to:", selectedId);
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer()?.batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  
  useEffect(() => {
    if (stageRef.current) {
      console.log("✅ Stage is ready in CanvasArea:", stageRef.current);
    }
  }, [stageRef.current]);

  const handleClick = (e) => {
    const clickedElement = e.target;
    
    if (clickedElement === clickedElement.getStage()) {
      setSelectedId(null);
      return;
    }
    
    const id = clickedElement.id();
    if (id) {
      setSelectedId(id);
    }
  };

  const handleElementUpdate = (updatedElement) => {
    const updatedElements = elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    setElements(updatedElements);
  };

  const handleTextDblClick = (e, element) => {
    e.cancelBubble = true;
    
    if (!stageRef.current) return;
    
    const textPosition = {
      x: stageRef.current.container().offsetLeft + element.x,
      y: stageRef.current.container().offsetTop + element.y
    };
    
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    
    textarea.value = element.text;
    textarea.style.position = 'absolute';
    textarea.style.top = textPosition.y + 'px';
    textarea.style.left = textPosition.x + 'px';
    textarea.style.width = element.fontSize * 8 + 'px';
    textarea.style.height = element.fontSize * 2 + 'px';
    textarea.style.fontSize = element.fontSize + 'px';
    textarea.style.border = '2px solid #3b82f6';
    textarea.style.padding = '5px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.transform = `rotate(${element.rotation || 0}deg)`;
    textarea.style.fontFamily = 'sans-serif';
    textarea.style.zIndex = 1000;
    
    textarea.focus();
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
    });
    
    textarea.addEventListener('blur', () => {
      const updatedElement = {
        ...element,
        text: textarea.value || 'Edit Me'
      };
      handleElementUpdate(updatedElement);
      document.body.removeChild(textarea);
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center p-4"
      style={{ backgroundColor: '#f1f5f9' }}
    >
      {/* Canvas Container */}
      <div 
        className="relative shadow-2xl rounded-xl overflow-hidden transition-all duration-300"
        style={{ 
          width: currentSize.width, 
          height: currentSize.height,
          backgroundColor: canvasBg || 'white',
        }}
      >
        <Stage
          ref={stageRef}
          width={currentSize.width}
          height={currentSize.height}
          onClick={handleClick}
          onTap={handleClick}
          style={{ backgroundColor: canvasBg || 'white' }}
        >
          <Layer>

            {elements.map((element) => {
              if (element.type === 'text') {
                return (
                  <Text
                    key={element.id}
                    id={element.id}
                    text={element.text || "Edit Me"}
                    x={element.x || 50}
                    y={element.y || 50}
                    fontSize={element.fontSize || 20}
                    fill={element.fill || '#333'}
                    draggable
                    onClick={() => setSelectedId(element.id)}
                    onTap={() => setSelectedId(element.id)}
                    onDblClick={(e) => handleTextDblClick(e, element)}
                    onDragEnd={(e) => {
                      handleElementUpdate({
                        ...element,
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      
                      node.scaleX(1);
                      node.scaleY(1);
                      
                      handleElementUpdate({
                        ...element,
                        x: node.x(),
                        y: node.y(),
                        fontSize: Math.max(8, (element.fontSize || 20) * scaleX),
                        rotation: node.rotation()
                      });
                    }}
                  />
                );
              }
              
              if (element.type === 'image' && element.src) {
                return (
                  <ImageElement
                    key={element.id}
                    element={element}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onTransform={handleElementUpdate}
                  />
                );
              }
              
              return null;
            })}

            {/* Audio Player */}
            {audioFile && (
              <CanvasAudioPlayer
                audioData={audioFile}
                isSelected={selectedId === audioFile.id}
                onSelect={() => setSelectedId(audioFile.id)}
                onChange={(updated) => {
                  setAudioFile(updated);
                }}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(prev => !prev)}
              />
            )}

        
            {selectedId && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={true}
                enabledAnchors={[
                  'top-left', 'top-center', 'top-right',
                  'middle-right', 'middle-left',
                  'bottom-left', 'bottom-center', 'bottom-right'
                ]}
                anchorSize={8}
                anchorCornerRadius={4}
                borderStroke="#3b82f6"
                borderStrokeWidth={2}
                anchorStroke="#3b82f6"
                anchorFill="white"
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasArea;