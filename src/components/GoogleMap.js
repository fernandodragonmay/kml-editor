import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  // LoadScript,
  // Data,
  useJsApiLoader,
  Polygon,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: -3.745,
  lng: -38.523,
};

function getCenterOfPolyline(coordinates) {
  let latSum = 0;
  let lngSum = 0;

  for (let i = 0; i < coordinates.length; i++) {
    latSum += coordinates[i][1];
    lngSum += coordinates[i][0];
  }

  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length,
  };
}

function MyComponent({ geojsonData }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBJDDOSHtrJ1kkyo5Zrjj55XYE55v77fus",
  });

  const mapRef = useRef();
  const [center, setCenter] = useState(defaultCenter);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);

  useEffect(() => {
    console.log("geojsonData", geojsonData);
    if (isLoaded && geojsonData) {
      const bounds = new window.google.maps.LatLngBounds();

      geojsonData.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coordinate) => {
            bounds.extend(
              new window.google.maps.LatLng(coordinate[1], coordinate[0])
            );
          });
        } else if (feature.geometry.type === "LineString") {
          feature.geometry.coordinates.forEach((coordinate) => {
            bounds.extend(
              new window.google.maps.LatLng(coordinate[1], coordinate[0])
            );
          });
        }
      });

      const newCenter = bounds.getCenter().toJSON();
      setCenter(newCenter);
      mapRef.current.fitBounds(bounds);
    }
  }, [isLoaded, geojsonData]);

  return (
    <div className="google-map" style={{ flex: 1, display: "grid" }}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {geojsonData &&
            geojsonData.features.map((feature, index) => {
              if (feature.geometry.type === "Polygon") {
                return (
                  <Polygon
                    key={`polygon-${index}`}
                    paths={feature.geometry.coordinates[0].map(
                      (coordinate) => ({
                        lat: coordinate[1],
                        lng: coordinate[0],
                      })
                    )}
                    options={{
                      fillColor: feature.properties?.fill,
                      fillOpacity: feature.properties?.["fill-opacity"],
                      strokeColor: feature.properties?.stroke,
                      strokeOpacity: feature.properties?.["stroke-opacity"],
                      strokeWeight: feature.properties?.["stroke-width"],
                    }}
                    onMouseOver={() => setSelectedFeature(feature)}
                    onMouseOut={() => setSelectedFeature(null)}
                  >
                    {selectedFeature === feature && (
                      <InfoWindow
                        position={feature.geometry.coordinates[0][0].reverse()}
                      >
                        <div>{feature.properties.name}</div>
                      </InfoWindow>
                    )}
                  </Polygon>
                );
              } else if (feature.geometry.type === "LineString") {
                return (
                  <Polyline
                    key={`polyline-${index}`}
                    path={feature.geometry.coordinates.map((coordinate) => ({
                      lat: coordinate[1],
                      lng: coordinate[0],
                    }))}
                    options={{
                      strokeColor:
                        selectedFeature === feature ||
                        editingFeature === feature
                          ? "red"
                          : feature.properties?.stroke,
                      strokeOpacity: feature.properties?.["stroke-opacity"],
                      strokeWeight:
                        selectedFeature === feature ||
                        editingFeature === feature
                          ? 5
                          : feature.properties?.["stroke-width"],
                    }}
                    onMouseOver={() => setSelectedFeature(feature)}
                    onMouseOut={() => setSelectedFeature(null)}
                    onClick={() => setEditingFeature(feature)}
                  >
                    {/* {selectedFeature === feature &&
                      (console.log(
                        "InfoWindow is being rendered",
                        getCenterOfPolyline(feature.geometry.coordinates)
                      ),
                      (
                        <InfoWindow
                          position={getCenterOfPolyline(
                            selectedFeature.geometry.coordinates
                          )}
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                          }}
                        >
                          <div
                            className="info-window-text"
                            style={{
                              backgroundColor: "white",
                              padding: "10px",
                              borderRadius: "5px",
                            }}
                          >
                            {selectedFeature.properties.name}
                            <button
                              onClick={() => setEditingFeature(selectedFeature)}
                            >
                              Edit
                            </button>
                          </div>
                        </InfoWindow>
                      ))} */}
                  </Polyline>
                );
              } else {
                return null;
              }
            })}

          {(selectedFeature || editingFeature) && (
            <InfoWindow
              position={getCenterOfPolyline(
                (selectedFeature || editingFeature).geometry.coordinates
              )}
              options={{
                pixelOffset: new window.google.maps.Size(0, -30),
              }}
              onCloseClick={() => {
                setSelectedFeature(null);
                setEditingFeature(null);
              }}
            >
              <div
                className="info-window-text"
                style={{
                  display: "flex",
                  gap: "4px",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  fontSize: "14px", 
                  color: "#333", 
                  fontFamily: "Arial, sans-serif", 
                }}
              >
                <span>{(selectedFeature || editingFeature).properties.name}</span>
                <button
                  onClick={() =>
                    setEditingFeature(selectedFeature || editingFeature)
                  }
                  style={{
                    backgroundColor: "#4CAF50", 
                    border: "none", 
                    color: "white", 
                    padding: "10px 20px", 
                    textAlign: "center", 
                    textDecoration: "none", 
                    display: "inline-block", 
                    fontSize: "16px", 
                    margin: "4px 2px", 
                    cursor: "pointer", 
                  }}
                >
                  Edit
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
}

export default React.memo(MyComponent);
