import React from "react";
import { TouchableOpacity } from 'react-native';
import { useTheme, themeColor } from "react-native-rapi-ui";
import { Ionicons, FontAwesome5, FontAwesome, Entypo, FontAwesome6,AntDesign   } from "@expo/vector-icons"; // Import additional libraries as needed
import Colors from "../../consts/Colors";

// This is a mapping object to map the string to the actual icon component
const IconSets = {
  Ionicons: Ionicons,
  FontAwesome5: FontAwesome5,
  FontAwesome: FontAwesome,
  Entypo : Entypo,
  FontAwesome6: FontAwesome6,
  AntDesign: AntDesign,
  // add more mappings for other icon libraries here
};

export default ({ library, icon, focused, style, size, onPress  }) => {
  const { isDarkmode } = useTheme();

  // Select the icon library component based on the library prop
  const IconComponent = IconSets[library] || Ionicons; // default to Ionicons if library is not specified

  return (
    <TouchableOpacity onPress={onPress} >
    <IconComponent
      name={icon}
      style={{ marginBottom: -7, ...style }}
      size={size || 24}
      color={
        focused
          ? isDarkmode
            ? Colors.primaryBlue
            : Colors.primaryBlue
          : Colors.grey
      }
    />
    </TouchableOpacity>
  );
};
