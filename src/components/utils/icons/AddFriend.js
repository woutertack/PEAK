import React from 'react';
import Svg, { G, Path, Circle, Text, TSpan, Defs, ClipPath, Rect } from 'react-native-svg';
import Colors from '../../../consts/Colors';

const AddFriend = () => {
  return (
 
    <Svg xmlns="http://www.w3.org/2000/svg" width="28" height="22.4" viewBox="0 0 28 22.4">
      <Path id="user-plus-solid" d="M4.2,5.6a5.6,5.6,0,1,1,5.6,5.6A5.6,5.6,0,0,1,4.2,5.6ZM0,21.1a7.8,7.8,0,0,1,7.8-7.8h4a7.8,7.8,0,0,1,7.8,7.8,1.3,1.3,0,0,1-1.3,1.3H1.3A1.3,1.3,0,0,1,0,21.1ZM22.05,13.65v-2.8h-2.8a1.05,1.05,0,0,1,0-2.1h2.8V5.95a1.05,1.05,0,1,1,2.1,0v2.8h2.8a1.05,1.05,0,1,1,0,2.1h-2.8v2.8a1.05,1.05,0,1,1-2.1,0Z" fill={Colors.white}/>
    </Svg>



);
};

export default AddFriend;