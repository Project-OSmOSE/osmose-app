import React, { MouseEvent, useState } from 'react';

export const AcousticFeatures: React.FC = () => {
  const [ top, setTop ] = useState<number>(96);
  const [ right, setRight ] = useState<number>(16);

  const [ isDragging, setIsDragging ] = useState<boolean>(false);


  const onMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    event.stopPropagation();
    event.preventDefault();
  }
  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      setTop(previous => previous + event.movementY);
      setRight(previous => previous - event.movementX);
    }
    event.stopPropagation();
    event.preventDefault();
  }
  const onMouseUp = (event: MouseEvent) => {
    setIsDragging(false);
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <div className="card ml-2 flex-grow-1 mini-content"
         style={ {
           position: 'absolute',
           top, right,
           cursor: 'move',
           userSelect: 'none'
         } }
         onMouseDown={ e => e.stopPropagation() }
         onMouseUp={ e => e.stopPropagation() }
         onMouseMove={ e => e.stopPropagation() }>
      <h6 className="card-header text-center"
          onMouseDown={ onMouseDown }
          onMouseMove={ onMouseMove }
          onMouseLeave={ onMouseUp }
          onMouseUp={ onMouseUp }>Acoustic features</h6>
      <div className="card-body">
      </div>
    </div>
  )
}