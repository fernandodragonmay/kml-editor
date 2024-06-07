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
  let lat = 0;
  let lng = 0;
  coordinates.forEach((coord) => {
    lng += coord[0];
    lat += coord[1];
  });
  return {
    lat: lat / coordinates.length,
    lng: lng / coordinates.length,
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
                      fillColor: feature.properties.fill,
                      fillOpacity: feature.properties["fill-opacity"],
                      strokeColor: feature.properties.stroke,
                      strokeOpacity: feature.properties["stroke-opacity"],
                      strokeWeight: feature.properties["stroke-width"],
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
                      strokeColor: feature.properties.stroke,
                      strokeOpacity: feature.properties["stroke-opacity"],
                      strokeWeight: feature.properties["stroke-width"],
                    }}
                    // onMouseOver={() => setSelectedFeature(feature)}
                    // onMouseOut={() => setSelectedFeature(null)}
                    onClick={() => setSelectedFeature(feature)}
                  >
                    {selectedFeature === feature &&
                      (console.log(
                        "InfoWindow is being rendered",
                        feature.geometry.coordinates
                      ),
                      (
                        <InfoWindow
                          position={getCenterOfPolyline(
                            feature.geometry.coordinates
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
                            {feature.properties.name}
                          </div>
                        </InfoWindow>
                      ))}
                  </Polyline>
                );
              } else {
                return null;
              }
            })}
        </GoogleMap>
      )}
    </div>
  );
}

export default React.memo(MyComponent);
