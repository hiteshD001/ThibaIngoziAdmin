// import { APIProvider, Map, Marker, Polyline } from '@vis.gl/react-google-maps';
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';

// const GoogleMaps = () => {
//     const [params] = useSearchParams();
//     const [currentLocation, setCurrentLocation] = useState();
//     const [path, setPath] = useState([]);

//     // Parse start and end locations from query params
//     const startLocation = {
//         lat: parseFloat(params.get("lat")),
//         lng: parseFloat(params.get("long"))
//     };

//     const endLocation = {
//         lat: parseFloat(params.get("end_lat")),
//         lng: parseFloat(params.get("end_long"))
//     };

//     // Initialize currentLocation on first render
//   useEffect(() => {
//     if (startLocation.lat && startLocation.lng) {
//       setCurrentLocation(startLocation);
//       setPath([startLocation]); // Initialize path with the start location
//     }
//   }, [params]); // Only run when params change

//   useEffect(() => {
//     if (!currentLocation) return; // Ensure the initial location is set

//     const interval = setInterval(() => {
//       setCurrentLocation((prevLocation) => {
//         if (!prevLocation) return startLocation; // Prevents undefined errors

//         const newLocation = {
//           lat: prevLocation.lat + 0.1, // Simulate movement
//           lng: prevLocation.lng + 0.1,
//         };

//         setPath((prevPath) => {
//           const updatedPath = [...prevPath, newLocation];
//           console.log(updatedPath, "-- Updated Path --"); // Debugging
//           return updatedPath;
//         }); // Update polyline path
//         return newLocation;
//     });
// }, 2000);

// return () => clearInterval(interval);
// }, [currentLocation]); // Only run when currentLocation changes

// console.log(path, "-- Path --");
//     return (
//         <div style={{ position: "relative" }}>
//             <div className='req_container'>
//                 {params.get("req_reach") && <span className='req_count'>Request Reached <p>{params.get("req_reach")}</p></span>}
//                 {params.get("req_accept") && <span className='req_count'>Request Accepted <p>{params.get("req_accept")}</p></span>}
//             </div>
//             <APIProvider apiKey={import.meta.env.VITE_MAP_API_KEY}>
//                 <Map
//                     style={{ width: "100%", height: "calc(100vh - 100px )" }}
//                     defaultZoom={16}
//                     mapId="mymap"
//                     defaultCenter={startLocation}
//                 >
//                     {/* Start Location Marker */}
//                     <Marker
//                         key="startLocation"
//                         position={startLocation}
//                         title="Trip Start"
//                     />
//                     {
//                     endLocation&&
//                     /* End Location Marker */
//                     <Marker
//                         key="endLocation"
//                         position={endLocation}
//                         title="Trip End"
//                         // icon={{
//                         //     url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
//                         // }}
//                     />
//                     }
//                     {path.length > 1 && ( // Polyline only renders if 2+ points exist
//             <Polyline
//               path={path}
//               options={{
//                 strokeColor: "#FF0000",
//                 strokeOpacity: 0.8,
//                 strokeWeight: 4,
//               }}
//             />
//           )}
//                 </Map>
//             </APIProvider>
//         </div>
//     );
// };

// export default GoogleMaps;

import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    useJsApiLoader,
    Polyline,
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
                    <Marker position={startLocation} title="Start Location" />
                )}
                {endLocation && (
                    <Marker position={endLocation} title="End Location" />
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
