import React, { useState, useRef } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../consts/Colors';
import SliderData from './SliderData';
import { Icon } from 'react-native-elements';
import  SliderIcon1 from '../utils/icons/SliderIcon1';
import SliderIcon2 from '../utils/icons/SliderIcon2';
import SliderIcon3 from '../utils/icons/SliderIcon3';

const screenWidth = Dimensions.get('window').width;

const Slider = () => {
 
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  
  const renderItem = ({ item, index }) => (
    <View style={[styles.slide, { width: screenWidth }]}>
      {index === 0 && <SliderIcon1 />}
      {index === 1 && <SliderIcon2 />}
      {index === 2 && <SliderIcon3 />}
      <Text style={styles.slideText}>{item.text}</Text>
      <View style={styles.pagination}>
        {SliderData.map((_, index) => (
          <View key={index} style={[styles.dot, index === currentIndex ? styles.activeDot : null]} />
        ))}
      </View>
    </View>
  );

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={SliderData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  slideText: {
    fontSize: 20,
    color: 'white',
    maxWidth: '75%',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    margin: 8,
  },
  activeDot: {
    backgroundColor: Colors.primaryGreen,
  }
});

export default Slider;
