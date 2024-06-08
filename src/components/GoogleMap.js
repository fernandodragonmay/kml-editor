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

function MyComponent({ geojsonData: initialGeojsonData }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef();
  const [geojsonData, setGeojsonData] = useState(initialGeojsonData);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draggingFeature, setDraggingFeature] = useState(null);

  useEffect(() => {
    setGeojsonData(initialGeojsonData);
  }, [initialGeojsonData]);

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

  const handleLineClick = (feature) => {
    setEditingFeature(feature);
    setStrokeWidth(feature.properties?.["stroke-width"] || 1);
    setName(feature.properties?.name || "");
    setColor(feature.properties?.stroke || "");
    // setIsEditing(true);
  };

  const handleEdit = () => {
    if (editingFeature) {
      const updatedFeatures = geojsonData.features.map((geojsonFeature) => {
        if (geojsonFeature === editingFeature) {
          return {
            ...geojsonFeature,
            properties: {
              ...geojsonFeature.properties,
              "stroke-width": strokeWidth, // Use the new stroke width here
              name: name, // Use the new name here
              stroke: color, // Use the new color here
            },
          };
        }
        return geojsonFeature;
      });

      setGeojsonData({ ...geojsonData, features: updatedFeatures });
      setEditingFeature(null);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // Set isEditing to false here
    setEditingFeature(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDragEnd = (index, type) => {
    return (e) => {
      const latLng = e.latLng.toJSON();
      const updatedFeatures = JSON.parse(
        JSON.stringify(geojsonData.features)
      ).map((feature, i) => {
        if (i === index && feature.geometry.type === type) {
          const updatedCoordinates = feature.geometry.coordinates.map(
            (coordinate) => {
              if (type === "Polygon") {
                return coordinate.map((coord) => {
                  return [
                    coord[0] +
                      latLng.lng -
                      draggingFeature.geometry.coordinates[0][0][0],
                    coord[1] +
                      latLng.lat -
                      draggingFeature.geometry.coordinates[0][0][1],
                    0,
                  ];
                });
              } else if (type === "LineString") {
                return [
                  coordinate[0] +
                    latLng.lng -
                    draggingFeature.geometry.coordinates[0][0],
                  coordinate[1] +
                    latLng.lat -
                    draggingFeature.geometry.coordinates[0][1],
                  0,
                ];
              }
              return coordinate;
            }
          );
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: updatedCoordinates,
            },
          };
        }
        return feature;
      });
      setGeojsonData({
        ...JSON.parse(JSON.stringify(geojsonData)),
        features: updatedFeatures,
      });
      setDraggingFeature(null);
    };
  };

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
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
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
                    onMouseOver={() => {
                      setSelectedFeature({ ...feature, index });
                      setEditingFeature(null); // Clear the editingFeature state
                    }}
                    onMouseOut={() => {
                      setSelectedFeature(null);
                      setIsEditing(false);
                    }}
                    onClick={() => setEditingFeature({ ...feature, index })}
                    onDragStart={() => {
                      setDraggingFeature(feature);
                    }}
                    onDragEnd={handleDragEnd(index, "Polygon")}
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
                    onMouseOver={() => {
                      setSelectedFeature(feature);
                      setEditingFeature(null); // Clear the editingFeature state
                    }}
                    onMouseOut={() => {
                      setSelectedFeature(null);
                      setIsEditing(false);
                    }}
                    onClick={() => handleLineClick(feature)}
                    onDragStart={() => {
                      setDraggingFeature(feature);
                    }}
                    onDragEnd={handleDragEnd(index, "LineString")}
                    draggable
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
                setIsEditing(false);
              }}
            >
              <div
                className="info-window-popup"
                style={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                  {(selectedFeature || editingFeature)?.id ||
                    `Polygon ${
                      selectedFeature?.geometry.type === "Polygon"
                        ? selectedFeature.id || selectedFeature.index + 1
                        : ""
                    }`}
                </div>
                <div style={{ color: "blue", fontSize: "18px" }}>
                  <span style={{ marginRight: "10px" }}>Name:</span>
                  {(selectedFeature || editingFeature).properties?.name ||
                    `Polygon ${
                      selectedFeature?.geometry.type === "Polygon"
                        ? selectedFeature.id || selectedFeature.index + 1
                        : ""
                    }`}
                </div>
                {isEditing ? (
                  <div>
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ marginRight: "10px" }}>Name: </label>
                      <input
                        type="text"
                        value={name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setName(e.target.value)}
                        className="info-window-input"
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ marginRight: "10px" }}>Size: </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={strokeWidth}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setStrokeWidth(e.target.value)}
                        className="info-window-input"
                        style={{ width: "50px" }}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ marginRight: "10px" }}>Color: </label>
                      <input
                        type="text"
                        value={color}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setColor(e.target.value)}
                        className="info-window-input"
                      />
                    </div>
                    <button
                      onClick={handleEdit}
                      className="info-window-button"
                      style={{ marginTop: "10px" }}
                    >
                      Change
                    </button>
                    <button
                      onClick={handleCancel}
                      className="info-window-button"
                      style={{ marginTop: "10px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="info-window-button"
                    style={{ marginTop: "10px" }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
}

export default React.memo(MyComponent);
