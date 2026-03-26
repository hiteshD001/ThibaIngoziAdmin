// src/components/HotspotMap.jsx
import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { Box, Typography } from '@mui/material';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '16px',
    position: 'relative'
};


function CrimeReportMap({ lat, long, address, isMapLoaded }) {
    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => setMap(map), []);
    const onUnmount = useCallback(() => setMap(null), []);

    return isMapLoaded ? (
        <Box sx={{ position: 'relative' }}>
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={{ lat: lat, lng: long }}
    zoom={15}
    onLoad={onLoad}
    onUnmount={onUnmount}
    options={{
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }}
  >
    <OverlayView
      position={{ lat: lat, lng: long }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        style={{
          position: 'relative',
          width: '30px',
          height: '30px',
          backgroundColor: 'red',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: '2px solid white',
          boxShadow: '0 4px 10px rgba(255,0,0,0.5)',
        }}
        title={address || 'Hotspot'}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: 'black',
            borderRadius: '50%',
            position: 'absolute',
            top: '7px',
            left: '7px',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </OverlayView>
  </GoogleMap>
</Box>
    ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
            <Typography>Loading Map...</Typography>
        </Box>
    );
}

export default React.memo(CrimeReportMap);
