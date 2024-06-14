import React, { useState, useRef } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../consts/Colors';
import SliderData from './SliderData';
import SliderIcon1 from '../utils/icons/Slider/SliderIcon1';
import SliderIcon2 from '../utils/icons/Slider/SliderIcon2';
import SliderIcon3 from '../utils/icons/Slider/SliderIcon3';
import SliderButton from './SliderButtons';
import ButtonIcon1 from '../utils/icons/Slider/ButtonIcon1';
import ButtonIcon2 from '../utils/icons/Slider/ButtonIcon2';
import ButtonIcon3 from '../utils/icons/Slider/ButtonIcon3';
import ButtonIcon4 from '../utils/icons/Slider/ButtonIcon4';
import ButtonIcon5 from '../utils/icons/Slider/ButtonIcon5';

const screenWidth = Dimensions.get('window').width;

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);

  const renderItem = ({ item, index }) => (
    <View style={[styles.slide, { width: screenWidth, height: index === 0 ? 500 : 400 }]}>
      {index === 0 ? (
        <View style={styles.buttonContainer}>
          <Text style={styles.mainText}>Het verhogen van je dagelijkse stappen kan je leven veranderen</Text>
          <View style={styles.sliderButton} >
          <SliderButton
            label="Helpt met gewichtsverlies"
            icon={<ButtonIcon1 />}
            onPress={() => {}}
          />
          <SliderButton
            label="Neemt amper tijd in"
            icon={<ButtonIcon2 />}
            onPress={() => {}}
          />
          <SliderButton
            label="Betere mentaal welzijn"
            icon={<ButtonIcon3 />}
            onPress={() => {}}
          />
          <SliderButton
            label="Beschermt je gezondheid"
            icon={<ButtonIcon4 />}
            onPress={() => {}}
          />
          <SliderButton
            label="Geen materiaal voor nodig"
            icon={<ButtonIcon5 />}
            onPress={() => {}}
            noLine={true}
          />
          </View>
        </View>
      ) : (
        <>
          {index === 1 && <SliderIcon1 />}
          {index === 2 && <SliderIcon2 />}
          {index === 3 && <SliderIcon3 />}

          {item.title && <Text style={styles.title}>{item.title}</Text>}
          <Text style={styles.slideText}>{item.text}</Text>
        </>
      )}
      <View style={styles.pagination}>
        {SliderData.map((_, dotIndex) => (
          <View key={dotIndex} style={[styles.dot, dotIndex === currentIndex ? styles.activeDot : null]} />
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
    height: 500,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: 40,

  },
  slideText: {
    fontSize: 18,
    color: 'white',
    maxWidth: '78.5%',
    marginTop: 7,
    marginBottom: 0,
    textAlign: 'center',
  },
  title:{
    fontSize: 22,
    color: 'white',
    maxWidth: '100%',
    marginTop: 35,
    marginBottom: 0,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainText:{
    fontSize: 19,
    color: 'white',
    maxWidth: '100%',
    marginTop: 15,
    marginBottom: 25,
    fontWeight: 'bold',
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
  },
  sliderButton: { 
    marginBottom: 10, 
    backgroundColor: Colors.darkGreen, 
    paddingTop: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.white,
  
  },
});

export default Slider;
