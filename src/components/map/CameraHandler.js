import React, { useEffect } from 'react';
import Mapbox from '@rnmapbox/maps';

const CameraHandler = ({ location, zoomLevel, cameraRef }) => {
  useEffect(() => {
    // Removed automatic centering logic
    console.log('CameraHandler initialized with location:', location, 'and zoom level:', zoomLevel);
  }, [location, zoomLevel]);

  return (
    <Mapbox.Camera
      ref={cameraRef}
      zoomLevel={zoomLevel}
      centerCoordinate={[location.longitude, location.latitude]}
      animationMode="flyTo"
      animationDuration={2000}
      maxZoomLevel={16}
    />
  );
};

export default CameraHandler;
