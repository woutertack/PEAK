import React from 'react';
import Mapbox, { ShapeSource, FillLayer, LineLayer, SymbolLayer } from '@rnmapbox/maps';
import Colors from '../../consts/Colors';

const MapLayers = ({ clusters, hexagons, zoomLevel, lineWidth }) => {
  return (
    <>
      {clusters && (
        <ShapeSource id="clusters" shape={clusters}>
          <FillLayer
            id="clusterFill"
            style={{
              fillColor: Colors.primaryGreen,
              fillOutlineColor: Colors.secondaryGreen,
              fillOpacity: 0.10,
            }}
          />
          <LineLayer
            id="clusterLine"
            style={{
              lineColor: Colors.secondaryGreen,
              lineWidth: lineWidth,
            }}
          />
          {zoomLevel <= 11.7 && (
            <SymbolLayer
              id="clusterCount"
              style={{
                textField: ['format', ['get', 'count'], {}],
                textSize: [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6.5, 0,
                  7, 12,
                  7.5, 20,
                  10, 30
                ],
                textColor: Colors.secondaryGreen,
                textIgnorePlacement: false,
                textAllowOverlap: true,
              }}
            />
          )}
        </ShapeSource>
      )}

      {hexagons && zoomLevel >= 11.7 && (
        <ShapeSource id="hexagons" shape={hexagons}>
          <FillLayer
            id="hexagonFill"
            style={{
              fillColor: Colors.primaryGreen,
              fillOutlineColor: Colors.secondaryGreen,
              fillOpacity: 0.10,
            }}
          />
          <LineLayer
            id="hexagonLine"
            style={{
              lineColor: Colors.secondaryGreen,
              lineWidth: lineWidth,
            }}
          />
        </ShapeSource>
      )}
    </>
  );
};

export default MapLayers;
