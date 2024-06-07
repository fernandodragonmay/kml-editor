import React, { useState } from "react";
// import GoogleMapReact from "google-map-react";
import GeoJsonUploader from "./components/FileUploader";
import GoogleMap from "./components/GoogleMap";
// import MedianIncomeKml from "./data/test.kml";

// const GOOGLE_API_KEY = "AIzaSyBJDDOSHtrJ1kkyo5Zrjj55XYE55v77fus";

export default function App() {
  const [geoData, setGeoData] = useState(null);

  const handleFileUpload = (data) => {
    setGeoData(data);
  };

  return (
    <div className="App" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GeoJsonUploader onFileUpload={handleFileUpload} />
      <GoogleMap geojsonData={geoData} />
      {/* <GoogleMapReact
        style={{ width: "100vw", height: "100vh" }}
        bootstrapURLKeys={{
          key: GOOGLE_API_KEY,
          libraries: ["visualization"]
        }}
        defaultCenter={{
          lat: 39.8496,
          lng: -75.2557
        }}
        defaultZoom={10}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          //map.data.loadGeoJson(MedianIncomeGeoJSON);
          const kml = new maps.KmlLayer({
            url: MedianIncomeKml
          });
          kml.setMap(map);
        }}
      ></GoogleMapReact> */}
    </div>
  );
}
