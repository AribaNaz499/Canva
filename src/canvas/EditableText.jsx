import React, { useEffect, useRef, useState } from 'react';
import { Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditableText = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);

  
  useEffect(() => {
    if (isSelected && trRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  return (
    <>
      
      <Text
        ref={shapeRef}
        {...el}
        visible={!isEditing} 
        draggable={!isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => setIsEditing(true)}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            fontSize: node.fontSize() * scaleY,
          });
        }}
      />

      {isEditing && (
        <Html>
          <textarea
            value={el.text}
            onChange={(e) => onChange({ text: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) setIsEditing(false);
            }}
            autoFocus
            style={{
              position: 'absolute',
              top: `${el.y}px`,
              left: `${el.x}px`,
              width: `${shapeRef.current.width()}px`,
              height: `${shapeRef.current.height()}px`,
              fontSize: `${el.fontSize}px`,
              color: el.fill,
              background: 'none',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: 0,
              margin: 0,
              lineHeight: 1,
              fontFamily: 'sans-serif',
            }}
          />
        </Html>
      )}

    
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default EditableText;