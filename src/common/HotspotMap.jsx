// src/components/HotspotMap.jsx
import React, { useCallback, useState } from "react";
import { GoogleMap, MarkerF, OverlayView } from "@react-google-maps/api";
import { Box, Typography } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "16px",
};

const defaultCenter = { lat: 23.0225, lng: 72.5714 };

function HotspotMap({ hotspots, isMapLoaded }) {
  const [map, setMap] = useState(null);
  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  return isMapLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={9}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {hotspots?.map((hotspot, index) => (
        <React.Fragment key={index}>
          {/* 🔴 Marker */}
          <MarkerF
            position={{
              lat: parseFloat(hotspot.lat),
              lng: parseFloat(hotspot.long),
            }}
          />

          {/* 🏷 Label Overlay */}
          <OverlayView
            position={{
              lat: parseFloat(hotspot.lat),
              lng: parseFloat(hotspot.long),
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                // padding: "4px 8px",
                textAlign: "center",
                transform: "translate(-50%, -100%)",
                whiteSpace: "nowrap",
              }}
            >
              {/* <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#000" }}
              >
                {hotspot.provinceName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#444" }}>
                {hotspot.totalCalls} Calls
              </Typography> */}
            </Box>
          </OverlayView>
        </React.Fragment>
      ))}
    </GoogleMap>
  ) : (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "500px",
      }}
    >
      <Typography>Loading Map...</Typography>
    </Box>
  );
}

export default React.memo(HotspotMap);
