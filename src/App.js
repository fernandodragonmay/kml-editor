import React, { useState } from "react";
import GeoJsonUploader from "./components/FileUploader";
import GoogleMap from "./components/GoogleMap";

export default function App() {
  const [geoData, setGeoData] = useState(null);

  const handleFileUpload = (data) => {
    setGeoData(data);
  };

  return (
    <div className="App" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GeoJsonUploader onFileUpload={handleFileUpload} />
      <GoogleMap geojsonData={geoData} />
    </div>
  );
}
