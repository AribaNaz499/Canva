import React, { useContext, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { CanvasContext } from '../context/CanvasContext';
import EditableText from '../canvas/EditableText';
import URLImage from '../canvas/URLImage'; 

const StageCanvas = ({ width, height }) => {
  const { 
    elements, 
    setElements, 
    selectedId, 
    setSelectedId, 
    canvasBg, 
    stageRef 
  } = useContext(CanvasContext);

  
  const handleStageClick = (e) => {
    const isStage = e.target === e.target.getStage();
    const isBackground = e.target.name() === 'canvas-bg';
    if (isStage || isBackground) {
      setSelectedId(null);
    }
  };

  return (
    <Stage
      width={width}
      height={height}
      ref={stageRef}
      onMouseDown={handleStageClick}
      onTouchStart={handleStageClick}
    >
      <Layer>
      
        <Rect 
          name="canvas-bg"
          width={width} 
          height={height} 
          fill={canvasBg} 
        />

      
        {elements.map((el) => {
        
          if (el.type === 'text') {
            return (
              <EditableText
                key={el.id}
                el={el}
                isSelected={el.id === selectedId}
                onSelect={(e) => {
                  if (e) e.cancelBubble = true; 
                  setSelectedId(el.id);
                }}
                onChange={(newAttrs) => {
                  setElements(elements.map(item => 
                    item.id === el.id ? { ...item, ...newAttrs } : item
                  ));
                }}
              />
            );
          }

        
          if (el.type === 'image') {
            return (
              <URLImage
                key={el.id}
                el={el}
                isSelected={el.id === selectedId}
                onSelect={(e) => {
                  if (e) e.cancelBubble = true; 
                  setSelectedId(el.id);
                }}
                onChange={(newAttrs) => {
                  setElements(elements.map(item => 
                    item.id === el.id ? { ...item, ...newAttrs } : item
                  ));
                }}
              />
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
};

export default StageCanvas;