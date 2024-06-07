"use client";

import { kml } from "@tmcw/togeojson";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

const GeoJsonUploader = ({ onFileUpload }) => {
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result;
        let data;
        if (file.name.endsWith(".geojson")) {
          data = JSON.parse(text);
        } else if (file.name.endsWith(".kml")) {
          const parser = new DOMParser();
          const kmlDoc = parser.parseFromString(text, "text/xml");
          data = kml(kmlDoc);
        }
        onFileUpload(data);
      } catch (error) {
        alert("Failed to process the file");
        console.error("Error processing file:", error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.google-earth.kml+xml": [".kml"],
      "application/geo+json": [".geojson"],
    },
    onDrop: (acceptedFiles) => acceptedFiles.forEach(processFile),
  });

  return (
    <div {...getRootProps()} style={{background: "blue", color: "white"}}>
      <input {...getInputProps()} accept=".geojson,.kml" />
      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            Processing...
          </p>
        </div>
      ) : (
        <div>
          <p>
            {isDragActive
              ? "Drop the files here ..."
              : "Drag 'n' drop some files here, or click to select files (only accepts *.GeoJSON, *.KML)"}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeoJsonUploader;
