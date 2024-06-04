const h3 = require("h3-reactnative");

export const clusterHexagons = (hexagons, zoomLevel) => {
  // Determine the resolution of the hexagons based on the zoom level
  const resolution = zoomLevelToResolution(zoomLevel);
  const clusteredHexagons = {};

  hexagons.forEach(hex => {
    const parentHex = h3.h3ToParent(hex, resolution);
    if (!clusteredHexagons[parentHex]) {
      clusteredHexagons[parentHex] = [];
    }
    clusteredHexagons[parentHex].push(hex);
  });

  const clusteredFeatures = Object.keys(clusteredHexagons).map(parentHex => {
    const hexBoundary = h3.h3ToGeoBoundary(parentHex, true);
    return {
      type: 'Feature',
      properties: {
        count: clusteredHexagons[parentHex].length,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [hexBoundary],
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features: clusteredFeatures,
  };
};

const zoomLevelToResolution = (zoomLevel) => {
  if (zoomLevel > 14) return 9;
  if (zoomLevel > 12) return 8;
  if (zoomLevel > 10) return 7;
  if (zoomLevel > 8) return 6;
  if (zoomLevel > 6) return 5;
  return 4;
};
