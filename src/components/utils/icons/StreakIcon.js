


import React from 'react';
import Svg, { G, Path, Circle, Text, TSpan } from 'react-native-svg';

const StreakIcon = ({ streak }) => {

  const fontSize = streak >= 10 ? 14 : 18;

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="36.821" height="43.184" viewBox="0 0 36.821 43.184">
      <G id="Group_90" data-name="Group 90" transform="translate(-367.02 -192.105)">
        <Path
          id="streak"
          d="M11.779,0a2.758,2.758,0,0,1,.463.134c4.328,2.4,7.129,6.238,6.588,10.827-.106.9-.371,1.779-.5,2.674a3.127,3.127,0,0,0,3.144,3.4c2.128.1,3.735-1.21,3.748-3.059A3.892,3.892,0,0,1,25.2,13.5c.013-.1.086-.263.157-.273a.67.67,0,0,1,.406.1,1.331,1.331,0,0,1,.295.316c3.858,4.751,4.661,11.858-.727,16.935A15.151,15.151,0,0,1,10.3,34.237c-5.722-1.526-9.168-5-10.1-10.119-.839-4.624,1-8.587,4.542-12.032,1.568-1.526,3.2-3.007,4.7-4.581A7.508,7.508,0,0,0,11.752.565,2.623,2.623,0,0,1,11.779,0ZM12.91,17.2l-.3-.1c-.613.551-1.24,1.09-1.837,1.654-2.118,2-3.52,4.251-3.484,7.055a6.711,6.711,0,0,0,6.173,6.273c3.689.446,7.178-1.5,8.157-4.581A5.1,5.1,0,0,0,21.2,23.3c-.265.15-.46.25-.642.365-2.8,1.769-6.547.7-7.378-2.2a16.333,16.333,0,0,1-.267-3.5c-.015-.252,0-.506,0-.758Z"
          transform="translate(367.021 192.105)"
          fill="#127780"
        />
        <G
          id="Ellipse_25"
          data-name="Ellipse 25"
          transform="translate(381.603 213.05)"
          fill="#fff"
          stroke="#127780"
          strokeWidth="1"
        >
          <Circle cx="11.119" cy="11.119" r="11.119" stroke="none" />
          <Circle cx="11.119" cy="11.119" r="10.619" fill="none" />
        </G>
        <Text
          id="streakNumber"
          transform={streak >= 10 ? "translate(384.829 229.221)" : "translate(387.4 230.289)"}
          fill="#127780"
          fontSize={fontSize}
          fontFamily="NirmalaUI, Nirmala UI"
        >
          <TSpan x="0" y="0">{streak}</TSpan>
        </Text>
      </G>
    </Svg>
  );
};

export default StreakIcon;
