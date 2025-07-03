import {Dimensions} from 'react-native';

const {width:deviceWidth, height:deviceHeight} = Dimensions.get('window');

export const hp = (heightPercent) => {
  const height = deviceHeight * (heightPercent / 100);
  return height;
};

export const wp = (widthPercent) => {
  const width = deviceWidth * (widthPercent / 100);
  return width;
};