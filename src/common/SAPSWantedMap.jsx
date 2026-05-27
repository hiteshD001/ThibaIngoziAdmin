import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Box, Typography } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "16px",
  position: "relative",
  marginTop: "35px",
};

function SAPSWantedMap({
  lat,
  long,
  address,
  isMapLoaded,
  onLocationChange,
}) {
  const [map, setMap] = useState(null);
  const [viewAddress, setViewAddress] = useState(address || "");

  const [center, setCenter] = useState({
    lat: lat || 0,
    lng: long || 0,
  });

  useEffect(() => {
    setCenter({
      lat: lat,
      lng: long,
    });
  }, [lat, long]);

  useEffect(() => {
    if (address) {
      setViewAddress(address);
    }
  }, [address]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleDragEnd = async (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();

    setCenter({
      lat: newLat,
      lng: newLng,
    });

    let newAddress = "";

    try {
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${import.meta.env.VITE_MAP_API_KEY}`
      );

      const data = await response.json();

      newAddress =
        data?.results?.[0]?.formatted_address || "";
      setViewAddress(newAddress);
      if (onLocationChange) {
        onLocationChange({
          lat: newLat,
          long: newLng,
          address: newAddress,
        });
      }
    } catch (err) {
      console.log("Geocode Error:", err);
    }
  };

  return isMapLoaded ? (
    <Box sx={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        <Marker
          position={center}
          draggable={true}
          onDragEnd={handleDragEnd}
          title={address || "Location"}
        />
      </GoogleMap>
      <Box sx={{ marginTop: '20px' }}>
        <Box mb={3}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>Location :- {viewAddress}</Typography>
        </Box>
      </Box>
    </Box>
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

export default React.memo(SAPSWantedMap);