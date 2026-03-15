import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const MapsContext = createContext({ isLoaded: false, loadError: null });

const mapLoaderOptions = {
  id: "google-map-script-main",
  googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
};

export function MapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader(mapLoaderOptions);

  if (loadError) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  return (
    <MapsContext.Provider value={{ isLoaded, loadError: null }}>
      {children}
    </MapsContext.Provider>
  );
}

export function useMaps() {
  const context = useContext(MapsContext);
  return context ?? { isLoaded: false, loadError: null };
}
