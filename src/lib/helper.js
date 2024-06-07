export function getCenterOfPolyline(coordinates) {
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

export function getCenterOfPolygon(coordinates) {
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  for (let i = 0; i < coordinates.length; i++) {
    for (let j = 0; j < coordinates[i].length; j++) {
      latSum += coordinates[i][j][1];
      lngSum += coordinates[i][j][0];
      count++;
    }
  }

  return {
    lat: latSum / count,
    lng: lngSum / count,
  };
}