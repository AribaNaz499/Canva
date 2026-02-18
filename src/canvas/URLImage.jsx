import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer, Group, Rect, Text } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const [img] = useImage(el.src);
  const shapeRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);
  const [initialCropData, setInitialCropData] = useState(null);

  // Default crop setting agar data mein nahi hai
  useEffect(() => {
    if (img && !el.crop) {
      onChange({
        ...el,
        crop: { x: 0, y: 0, width: 100, height: 100 }
      });
    }
  }, [img]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Crop mode start karte waqt initial state save karo
  const handleDoubleClick = () => {
    setIsCropping(true);
    setInitialCropData({
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      crop: { ...el.crop }
    });
  };

  if (!img) return null;

  // const handleTransformEnd = () => {
  //   const node = shapeRef.current;
  //   const scaleX = node.scaleX();
  //   const scaleY = node.scaleY();

  //   node.scaleX(1);
  //   node.scaleY(1);

  //   if (isCropping) {
  //     // --- CROP MODE LOGIC ---
  //     // Image dimensions
  //     const imgWidth = img.width;
  //     const imgHeight = img.height;
      
  //     // Current display dimensions
  //     const displayWidth = node.width() * scaleX;
  //     const displayHeight = node.height() * scaleY;
      
  //     // Position changes
  //     const deltaX = node.x() - initialCropData.x;
  //     const deltaY = node.y() - initialCropData.y;
      
  //     // Scale factors
  //     const scaleFactorX = imgWidth / initialCropData.width;
  //     const scaleFactorY = imgHeight / initialCropData.height;
      
  //     // New crop values
  //     let newCropX = initialCropData.crop.x - (deltaX * scaleFactorX);
  //     let newCropY = initialCropData.crop.y - (deltaY * scaleFactorY);
      
  //     // Handle scaling (zooming) during crop
  //     const widthScale = displayWidth / initialCropData.width;
  //     const heightScale = displayHeight / initialCropData.height;
      
  //     let newCropWidth = initialCropData.crop.width / widthScale;
  //     let newCropHeight = initialCropData.crop.height / heightScale;
      
  //     // Boundary checks - crop area cannot exceed image boundaries
  //     newCropX = Math.max(0, Math.min(newCropX, imgWidth - newCropWidth));
  //     newCropY = Math.max(0, Math.min(newCropY, imgHeight - newCropHeight));
  //     newCropWidth = Math.min(newCropWidth, imgWidth - newCropX);
  //     newCropHeight = Math.min(newCropHeight, imgHeight - newCropY);
      
  //     // Update crop data
  //     onChange({
  //       ...el,
  //       crop: {
  //         x: newCropX,
  //         y: newCropY,
  //         width: newCropWidth,
  //         height: newCropHeight
  //       },
  //       // Reset position and size to original display values
  //       x: initialCropData.x,
  //       y: initialCropData.y,
  //       width: initialCropData.width,
  //       height: initialCropData.height
  //     });
      
  //     // Update initial data for next transform
  //     setInitialCropData({
  //       x: initialCropData.x,
  //       y: initialCropData.y,
  //       width: initialCropData.width,
  //       height: initialCropData.height,
  //       crop: {
  //         x: newCropX,
  //         y: newCropY,
  //         width: newCropWidth,
  //         height: newCropHeight
  //       }
  //     });
      
  //   } else {
  //     // --- RESIZE MODE LOGIC ---
  //     onChange({
  //       ...el,
  //       x: node.x(),
  //       y: node.y(),
  //       width: node.width() * scaleX,
  //       height: node.height() * scaleY,
  //     });
  //   }
  // };

  // const handleDragEnd = (e) => {
  //   if (isCropping) {
  //     const node = shapeRef.current;
  //     handleTransformEnd();
  //   } else {
  //     const node = shapeRef.current;
  //     onChange({
  //       ...el,
  //       x: node.x(),
  //       y: node.y()
  //     });
  //   }
  // };

  const handleCropComplete = () => {
    setIsCropping(false);
    setInitialCropData(null);
  };

  const handleCropCancel = () => {
  
    if (initialCropData) {
      onChange({
        ...el,
        x: initialCropData.x,
        y: initialCropData.y,
        width: initialCropData.width,
        height: initialCropData.height,
        crop: { ...initialCropData.crop }
      });
    }
    setIsCropping(false);
    setInitialCropData(null);
  };

  return (
    <Group>
    
      {isCropping && initialCropData && (
        <Image
          image={img}
          x={initialCropData.x}
          y={initialCropData.y}
          width={initialCropData.width}
          height={initialCropData.height}
          opacity={0.3}
          listening={false}
        />
      )}

    
      <Image
        ref={shapeRef}
        image={img}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        crop={el.crop}
        draggable={isSelected && isCropping}
        onClick={onSelect}
        onDblClick={handleDoubleClick}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleDragEnd}
        stroke={isCropping ? "#00aaff" : null}
        strokeWidth={isCropping ? 2 : 0}
        strokeScaleEnabled={false}
        shadowEnabled={!isCropping}
      />

      {/* 3. Transformer */}
      {/* {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={!isCropping}
          keepRatio={isCropping ? true : true}
          enabledAnchors={
            isCropping
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
              : ['top-left', 'top-right', 'bottom-left', 'bottom-right']
          }
          anchorFill={isCropping ? "#00aaff" : "#ffffff"}
          anchorStroke={isCropping ? "#ffffff" : "#00aaff"}
          anchorSize={8}
          borderStroke={isCropping ? "#00aaff" : "#00aaff"}
          borderStrokeWidth={isCropping ? 2 : 1}
          borderDash={isCropping ? [5, 5] : null}
        />
      )} */}

     
      {isCropping && (
        <Group>
          
          <Text
            x={el.x}
            y={el.y - 25}
            text="🖼️ Crop Mode - Drag or resize to adjust crop"
            fontSize={12}
            fill="#00aaff"
            background="white"
            padding={4}
            cornerRadius={4}
          />
          
         
          <Rect
            x={el.x + el.width - 70}
            y={el.y + el.height + 5}
            width={60}
            height={25}
            fill="#00aaff"
            cornerRadius={5}
            onClick={handleCropComplete}
            shadowEnabled={true}
            shadowBlur={5}
            shadowOpacity={0.3}
          />
          <Text
            x={el.x + el.width - 70}
            y={el.y + el.height + 5}
            width={60}
            height={25}
            text="✓ Done"
            fontSize={12}
            fill="white"
            align="center"
            verticalAlign="middle"
            onClick={handleCropComplete}
          />
          
          {/* Cancel button */}
          <Rect
            x={el.x + el.width - 135}
            y={el.y + el.height + 5}
            width={60}
            height={25}
            fill="#ff4444"
            cornerRadius={5}
            onClick={handleCropCancel}
            shadowEnabled={true}
            shadowBlur={5}
            shadowOpacity={0.3}
          />
          <Text
            x={el.x + el.width - 135}
            y={el.y + el.height + 5}
            width={60}
            height={25}
            text="✕ Cancel"
            fontSize={12}
            fill="white"
            align="center"
            verticalAlign="middle"
            onClick={handleCropCancel}
          />
        </Group>
      )}
    </Group>
  );
};

export default URLImage;