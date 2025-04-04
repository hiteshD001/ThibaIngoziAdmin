import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    InfoWindow,
    useJsApiLoader,
    Circle,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetLocationByLocationId } from "../API Calls/API";
import { GoogleMapConfirm } from "./ConfirmationPOPup";

const mapContainerStyle = { width: "100%", height: "calc(100vh - 100px )" };

const GoogleMaps = () => {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const [directions, setDirections] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [message, setMessage] = useState("");
    const [startMarkerVisible, setStartMarkerVisible] = useState(false);
    const [endMarkerVisible, setEndMarkerVisible] = useState(false);
    const [startInfo, setStartInfo] = useState("");
    const [endInfo, setEndInfo] = useState("");
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const { locations } = useGetLocationByLocationId(params.get("locationId"));
    const mapRef = useRef(null);
    const startLocation = {
        lat: parseFloat(params.get("lat")),
        lng: parseFloat(params.get("long")),
    };
    const endLocation = {
        lat: parseFloat(params.get("end_lat")),
        lng: parseFloat(params.get("end_long")),
    };
    const [mapCenter] = useState(startLocation);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
    });

    // Reverse geocoding to get the address from lat/lng
    const getAddressFromLatLng = (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve, reject) => {
            const latLng = new window.google.maps.LatLng(lat, lng);
            geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject("No address found");
                }
            });
        });
    };

    useEffect(() => {
        let location = null;
        if (
            !isLoaded ||
            !startLocation.lat ||
            !startLocation.lng ||
            !endLocation.lat ||
            !endLocation.lng
        )
            return;

        // Fetch the addresses for the start and end locations
        Promise.all([
            getAddressFromLatLng(startLocation.lat, startLocation.lng),
            getAddressFromLatLng(endLocation.lat, endLocation.lng),
        ])
            .then(([startAddr, endAddr]) => {
                setStartAddress(startAddr);
                setEndAddress(endAddr);
            })
            .catch((err) => console.error("Geocoding error:", err));

        if (locations?.long && locations?.lat) {
            location = {
                lat: Number(locations.lat),
                lng: Number(locations.long),
            };
        } else if (locations?.message) {
            setConfirm(true);
            setMessage(locations.message);
        } else {
            location = startLocation;
        }

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: location,
                destination: endLocation,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                } else if (status === "ZERO_RESULTS") {
                    setConfirm(true);
                    setMessage("No route found");
                } else {
                    console.error("Directions request failed: ", status);
                }
            }
        );
    }, [isLoaded, params, locations]);

    const handleStartMarkerHover = () => {
        const startedAt = new Date(params.get("startedAt")).toLocaleString();
        const startLocationInfo = `Start Location: ${startAddress}`;
        setStartInfo(`${startLocationInfo}`);
        setStartMarkerVisible(true);
    };

    const handleEndMarkerHover = () => {
        const endedAt = new Date(params.get("endedAt")).toLocaleString();
        const endLocationInfo = `End Location: ${endAddress}`;
        setEndInfo(` ${endLocationInfo}`);
        setEndMarkerVisible(true);
    };

    const handleMarkerMouseOut = () => {
        setStartMarkerVisible(false);
        setEndMarkerVisible(false);
    };

    const handleConfirm = () => {
        setConfirm(false);
        nav("/home/total-drivers");
    };

    if (!isLoaded) return <p>Loading Map...</p>;

    return (
        <>
            <GoogleMap
                ref={mapRef}
                key={JSON.stringify(directions)}
                mapContainerStyle={mapContainerStyle}
                zoom={10}
                center={mapCenter}
            >
                {startLocation && (
                    <Marker
                        position={startLocation}
                        title="Start Location"
                        onMouseOver={handleStartMarkerHover}
                        onMouseOut={handleMarkerMouseOut}
                    >
                        {startMarkerVisible && (
                            <InfoWindow>
                                <div>{startInfo}</div>
                            </InfoWindow>
                        )}
                    </Marker>
                )}
                {endLocation && (
                    <Marker
                        position={endLocation}
                        title="End Location"
                        onMouseOver={handleEndMarkerHover}
                        onMouseOut={handleMarkerMouseOut}
                    >
                        {endMarkerVisible && (
                            <InfoWindow>
                                <div>{endInfo}</div>
                            </InfoWindow>
                        )}
                    </Marker>
                )}

                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            polylineOptions: {
                                strokeColor: "#0000FF",
                                strokeOpacity: 1,
                                strokeWeight: 5,
                            },
                            suppressPolylines: false,
                            suppressMarkers: false,
                            suppressInfoWindows: true,
                        }}
                        panel={null}
                    />
                )}
                {locations?.lat && locations?.lng && (
                    <Circle
                        center={{ lat: locations.lat, lng: locations.lng }}
                        radius={1000}
                        options={{
                            strokeColor: "#0000FF",
                            strokeOpacity: 1,
                            strokeWeight: 25,
                            fillColor: "#0000FF",
                            fillOpacity: 1,
                        }}
                    />
                )}
            </GoogleMap>
            {confirm && (
                <GoogleMapConfirm
                    message={message}
                    handleConfirm={handleConfirm}
                />
            )}
        </>
    );
};

export default GoogleMaps;
