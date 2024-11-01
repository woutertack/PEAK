import React from "react";
import { View, ActivityIndicator, Dimensions, Text, StyleSheet } from "react-native";
import { Layout, themeColor } from "react-native-rapi-ui";
import Svg, { G, Path, Defs, ClipPath, Rect, Polygon, Polyline } from 'react-native-svg';
import Colors from "../../consts/Colors";
import Logo from "../../components/utils/icons/Logo";
import useStatusBar from "../../helpers/useStatusBar";

export default function () {
  useStatusBar(Colors.secondaryGreen, 'light-content');

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  return (
    <>
    
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.secondaryGreen
        }}
      >
        <Svg xmlns="http://www.w3.org/2000/svg" width="430" height="932" viewBox="0 0 430 932"
        style={{
          position: 'absolute', // Cover the entire screen
          top: 0,
          left: 0,
        }}>
          <Defs>
            <ClipPath id="clip-path">
              <Rect id="Rectangle_5" data-name="Rectangle 5" width="430" height="932" transform="translate(0 0.03)" fill="none"/>
            </ClipPath>
          </Defs>
          <G id="Group_38" data-name="Group 38" transform="translate(0 0.318)">
            <G id="Group_37" data-name="Group 37" transform="translate(0 -0.348)" clip-path="url(#clip-path)">
      
              
              <Path id="Path_33" data-name="Path 33" d="M196.067,260.66a12.46,12.46,0,1,1-12.46-12.46,12.461,12.461,0,0,1,12.46,12.46" transform="translate(-105.682 -153.009)" fill="#44f1b6"/>
              <Path id="Path_34" data-name="Path 34" d="M1006.8,1303.981a4.4,4.4,0,1,1-4.4-4.4,4.4,4.4,0,0,1,4.4,4.4" transform="translate(-647.263 -917.236)" fill="#44f1b6"/>
              <Path id="Path_35" data-name="Path 35" d="M493.72,1831.369c-.371,2.649-2.935,4.222-6.07,4.7a59.556,59.556,0,0,0-13.355,3.666c-3.579,1.448-7.591,2.894-11.23.708-3.7-2.223-4.648-6.95-3.644-10.907,3.516-13.858,28.269-13.985,33.7-1.6l.021.048a6.352,6.352,0,0,1,.575,3.387" transform="translate(-283.459 -1122.901)" fill="#44f1b6"/>
              <Path id="Path_36" data-name="Path 36" d="M129.633,1223.308c-1.278-1.144-1.2-3.072-.332-4.911a38.2,38.2,0,0,0,2.823-8.419c.508-2.422,1.173-5.075,3.637-6.23,2.506-1.175,5.36.011,7.108,1.96,6.119,6.825-2.661,20.044-11.2,18.51l-.033-.006a4.072,4.072,0,0,1-2.008-.9" transform="translate(-79.448 -666.77)" fill="#44f1b6"/>
              <Path id="Path_37" data-name="Path 37" d="M745.467,715.674c-.02,1.009-.094,1.961-.181,2.779-.286,2.694-1.21,5.589-3.889,6.693-2.634,1.085-6.024-.138-7.943-2.11-4.661-4.792-2.508-13.712,3.353-16.492a5.909,5.909,0,0,1,4.966-.19c3.358,1.58,3.757,6.088,3.693,9.321" transform="translate(-451.342 -435.632)" fill="#44f1b6"/>
              <Path id="Path_38" data-name="Path 38" d="M913.9,2205.7c-.993-.18-1.921-.405-2.715-.621-2.614-.71-5.325-2.083-5.989-4.9-.653-2.773,1.094-5.925,3.347-7.505,5.473-3.839,13.936-.294,15.749,5.934a5.908,5.908,0,0,1-.6,4.933c-2.094,3.064-6.609,2.741-9.79,2.164" transform="translate(-558.868 -1352.729)" fill="#fff"/>
            </G>
          </G>
        </Svg>

        <View>
         
          <Logo  width={300} height={48.5}/>
         
          <Text style={styles.text}>ELKE STAP NAAR JOUW TOP TELT</Text>
        </View>

      </View>
      </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#44f1b6',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
});


