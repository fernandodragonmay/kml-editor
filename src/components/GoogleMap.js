import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { getCenterOfPolygon, getCenterOfPolyline } from "../lib/helper";
import { containerStyle, defaultCenter } from "../lib/const";

function MyComponent({ geojsonData }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
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
    <div className="kml-editor-google-map">
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
                    onMouseOver={() =>
                      setSelectedFeature({ ...feature, index })
                    }
                    onMouseOut={() => setSelectedFeature(null)}
                    onClick={() => setEditingFeature({ ...feature, index })}
                  ></Polygon>
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
                  ></Polyline>
                );
              } else {
                return null;
              }
            })}

          {(selectedFeature || editingFeature) && (
            <InfoWindow
              position={
                selectedFeature?.geometry.type === "Polygon"
                  ? getCenterOfPolygon(
                      (selectedFeature || editingFeature).geometry.coordinates
                    )
                  : getCenterOfPolyline(
                      (selectedFeature || editingFeature).geometry.coordinates
                    )
              }
              options={{
                pixelOffset: new window.google.maps.Size(0, -30),
              }}
              onCloseClick={() => {
                setSelectedFeature(null);
                setEditingFeature(null);
              }}
            >
              <div className="info-window-popup">
                <span>
                  {(selectedFeature || editingFeature).properties?.name ||
                    `Polygon ${
                      selectedFeature?.geometry.type === "Polygon"
                        ? selectedFeature.id || selectedFeature.index + 1
                        : ""
                    }`}
                </span>
                <button
                  onClick={() =>
                    setEditingFeature(selectedFeature || editingFeature)
                  }
                  className="info-window-button"
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
