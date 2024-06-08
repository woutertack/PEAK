import React from 'react';
import Svg, { G, Path, Circle, Text as SvgText, TSpan } from 'react-native-svg';

const PlaceIcon = ({ place }) => {
  return (
    
<Svg xmlns="http://www.w3.org/2000/svg" width="49.128" height="48.95" viewBox="0 0 49.128 48.95">
  <Path id="Path_207" data-name="Path 207" d="M7165.743,1634.342a22.235,22.235,0,0,1,14.118-2.671l.139.02c.089.01-1.418-.353-1.418-.353l-7.1-11.291-20.587-9Z" transform="translate(-7150.896 -1611.043)" fill="#fff"/>
  <Path id="Path_208" data-name="Path 208" d="M7270.853,1617.479l11.584-4.951-14.113,20.351-5.709-2.167-3.764-5.944,3.764-5.478" transform="translate(-7233.309 -1610.05)" fill="#fff"/>
  <G id="Ellipse_42" data-name="Ellipse 42" transform="translate(10.104 18.95)" fill="#fff" stroke="#127780" stroke-width="1">
    <Circle cx="15" cy="15" r="15" stroke="none"/>
    <Circle cx="15" cy="15" r="14.5" fill="none"/>
  </G>
  <G id="Ellipse_43" data-name="Ellipse 43" transform="translate(14.104 22.95)" fill="#fff" stroke="#127780" stroke-width="1">
    <Circle cx="11" cy="11" r="11" stroke="none"/>
    <Circle cx="11" cy="11" r="10.5" fill="none"/>
  </G>
      <SvgText
        id="number"
        transform="translate(25 35)"
        fill="#127780"
        fontSize="15" // Adjust font size as needed
        fontFamily="Roboto-Medium, Roboto"
        fontWeight="500"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        <TSpan x="0" y="0">{ place }</TSpan>
      </SvgText>
    </Svg>
  );
};

export default PlaceIcon;


<svg xmlns="http://www.w3.org/2000/svg" width="49.128" height="48.95" viewBox="0 0 49.128 48.95">
  <path id="Path_207" data-name="Path 207" d="M7165.743,1634.342a22.235,22.235,0,0,1,14.118-2.671l.139.02c.089.01-1.418-.353-1.418-.353l-7.1-11.291-20.587-9Z" transform="translate(-7150.896 -1611.043)" fill="#fff"/>
  <path id="Path_208" data-name="Path 208" d="M7270.853,1617.479l11.584-4.951-14.113,20.351-5.709-2.167-3.764-5.944,3.764-5.478" transform="translate(-7233.309 -1610.05)" fill="#fff"/>
  <g id="Ellipse_42" data-name="Ellipse 42" transform="translate(10.104 18.95)" fill="#fff" stroke="#127780" stroke-width="1">
    <circle cx="15" cy="15" r="15" stroke="none"/>
    <circle cx="15" cy="15" r="14.5" fill="none"/>
  </g>
  <g id="Ellipse_43" data-name="Ellipse 43" transform="translate(14.104 22.95)" fill="#fff" stroke="#127780" stroke-width="1">
    <circle cx="11" cy="11" r="11" stroke="none"/>
    <circle cx="11" cy="11" r="10.5" fill="none"/>
  </g>
  <text id="_1" data-name="1" transform="translate(20.104 39.95)" fill="#127780" font-size="17" font-family="Roboto-Medium, Roboto" font-weight="500"><tspan x="0" y="0">1</tspan></text>
</svg>


