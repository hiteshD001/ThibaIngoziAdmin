import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useSearchParams } from 'react-router-dom';

const GoogleMaps = () => {
    const [params] = useSearchParams()

    const location = { lat: parseFloat(params.get("lat")), lng: parseFloat(params.get("long")) }

    console.log(location)

    return (
        <div >
            <APIProvider apiKey={'AIzaSyCRUWdlYTEYbTeQ0bcZ0yoM6lLiVL6vNs4'} onLoad={() => console.log('Maps API has loaded.')}>
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