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

const center = {
    lat: 23.0225,
    lng: 72.5714,
};

const getColor = (count) => {
    if (count > 71) return '#ef4444'; // red
    if (count > 30) return '#f97316'; // orange
    return '#eab308'; // yellow
};

function HotspotMap({ hotspots, isMapLoaded }) {
    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => setMap(map), []);
    const onUnmount = useCallback(() => setMap(null), []);

    return isMapLoaded ? (
        <Box sx={{ position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    ],
                }}
            >
                {hotspots?.map((hotspot, index) => {
                    const color = getColor(hotspot.calls);

                    return (
                        <OverlayView
                            key={index}
                            position={{ lat: hotspot.lat, lng: hotspot.long }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    boxShadow: `0 0 10px 10px ${color}66`,
                                    border: `2px solid white`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                title={hotspot.address || 'Hotspot'}
                            />
                        </OverlayView>
                    );
                })}
            </GoogleMap>
            {/* 🔸 Legend Box */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: 2,
                    fontSize: 14,
                }}
            >
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} /> High (71+)
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316' }} /> Medium (31–70)
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#eab308' }} /> Low (0–30)
                </Typography>
            </Box>
        </Box>
    ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
            <Typography>Loading Map...</Typography>
        </Box>
    );
}

export default React.memo(HotspotMap);
