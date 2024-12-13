import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useSearchParams } from 'react-router-dom';

const GoogleMaps = () => {
    const [params] = useSearchParams()

    const location = { lat: parseFloat(params.get("lat")), lng: parseFloat(params.get("long")) }

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
                    defaultCenter={location}>
                    <Marker
                        key={"Hotspot"}
                        position={location}>
                    </Marker>
                </Map>
            </APIProvider>
        </div>
    )
}

export default GoogleMaps