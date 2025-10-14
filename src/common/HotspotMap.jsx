// src/components/HotspotMap.jsx
import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Typography } from '@mui/material';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  position: 'relative'
};

const center = {
    lat: 23.0225,
    lng: 72.5714,
};

function HotspotMap({ hotspots, isMapLoaded }) {
  const [map, setMap] = React.useState(null);

    const onLoad = React.useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    return isMapLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {hotspots?.map((hotspot, index) => (
                <Marker
                    key={index}
                    position={{ lat: hotspot.lat, lng: hotspot.long }}
                    title={hotspot.address || 'Hotspot'}
                />

            ))}
            <></>
        </GoogleMap>
    ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
            <Typography>Loading Map...</Typography>
        </Box>
    );
}

export default React.memo(HotspotMap);
