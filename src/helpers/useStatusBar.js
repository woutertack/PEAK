// hook for updating status bar color and style when unmounted
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';

const useStatusBar = (backgroundColor, barStyle) => {
  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setBackgroundColor(backgroundColor);
      RNStatusBar.setBarStyle(barStyle);
    }, [backgroundColor, barStyle])
  );
};

export default useStatusBar;
