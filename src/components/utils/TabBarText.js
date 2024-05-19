import React from "react";
import { Text, themeColor, useTheme } from "react-native-rapi-ui";
import Colors from "../../consts/Colors";
export default ({ title, focused }) => {
  const { isDarkmode } = useTheme();
  return (
    <Text
      fontWeight="bold"
      style={{
        marginBottom: 5,
        color: focused
          ? isDarkmode
          ? Colors.primaryBlue
          : Colors.primaryBlue
        : Colors.grey,
        fontSize: 10,
      }}
    >
      {title}
    </Text>
  );
};
