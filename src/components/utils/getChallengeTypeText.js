const getChallengeTypeText = (type) => {
  switch (type) {
    case 'steps':
      return 'stappen';
    case 'hexagons':
      return 'gebieden';
    case 'distance':
      return 'kilometer';
    default:
      return type;
  }
};


export default getChallengeTypeText;