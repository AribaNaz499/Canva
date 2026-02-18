import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const [img] = useImage(el.src);
  const shapeRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);


  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isCropping, img]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...el,
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };


  if (!img) return null;

  return (
    <>
      <Image
        ref={shapeRef}
        image={img}
        {...el}
      
        crop={el.crop || { x: 0, y: 0, width: img.width, height: img.height }}
        draggable={!isCropping}
        onClick={onSelect}
        onTap={onSelect}
        
        onDblClick={() => {
          console.log("Double clicked! Crop mode:", !isCropping);
          setIsCropping(!isCropping);
        }}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={handleTransformEnd}
      />
      
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={!isCropping}
          keepRatio={!isCropping}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
        />
      )}

    
      {isCropping && isSelected && (
        <Rect
          x={el.x}
          y={el.y - 25}
          width={100}
          height={20}
          fill="#9333ea"
          cornerRadius={4}
        />
      )}
    </>
  );
};

export default URLImage;