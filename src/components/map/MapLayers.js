import React from 'react';
import Mapbox, { ShapeSource, FillLayer, LineLayer, SymbolLayer } from '@rnmapbox/maps';
import Colors from '../../consts/Colors';

const MapLayers = ({ clusters, hexagons, zoomLevel, lineWidth }) => {
  return (
    <>
      <ShapeSource id="clusters" shape={clusters} belowLayerID="userLocation">
        <FillLayer
          id="clusterFill"
          style={{
            fillColor: Colors.primaryGreen,
            fillOutlineColor: Colors.secondaryGreen,
            fillOpacity: [
              'interpolate',
              ['linear'],
              ['get', 'totalVisits'],
              1, 0.075,
              8, 0.95
            ],
          }}
        />
        <LineLayer
          id="clusterLine"
          style={{
            lineColor: Colors.secondaryGreen,
            lineWidth: lineWidth,
          }}
        />
        {zoomLevel <= 12.3 && (
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
    </>
  );
};

export default MapLayers;
