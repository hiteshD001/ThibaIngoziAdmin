import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useSearchParams } from 'react-router-dom';

const GoogleMaps = () => {
    const [params] = useSearchParams();
    
    // Parse start and end locations from query params
    const startLocation = { 
        lat: parseFloat(params.get("lat")), 
        lng: parseFloat(params.get("long")) 
    };
    
    const endLocation = { 
        lat: parseFloat(params.get("end_lat")), 
        lng: parseFloat(params.get("end_long")) 
    };

    return (
        <div style={{ position: "relative" }}>
            <div className='req_container'>
                {params.get("req_reach") && <span className='req_count'>Request Reached <p>{params.get("req_reach")}</p></span>}
                {params.get("req_accept") && <span className='req_count'>Request Accepted <p>{params.get("req_accept")}</p></span>}
            </div>
            <APIProvider apiKey={import.meta.env.VITE_MAP_API_KEY}>
                <Map
                    style={{ width: "100%", height: "calc(100vh - 100px )" }}
                    defaultZoom={16}
                    mapId="mymap"
                    defaultCenter={startLocation}
                >
                    {/* Start Location Marker */}
                    <Marker
                        key="startLocation"
                        position={startLocation}
                        title="Trip Start"
                    />
                    {
                    endLocation&&
                    /* End Location Marker */
                    <Marker
                        key="endLocation"
                        position={endLocation}
                        title="Trip End"
                        // icon={{
                        //     url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        // }}
                    />
                    }
                </Map>
            </APIProvider>
        </div>
    );
};

export default GoogleMaps;
