const formatChallengeDescription = (type, goal) => {
  switch (type) {
    case 'hexagons':
      return `Ontdek ${goal} gebieden`;
    case 'steps':
      return `Leg ${goal} stappen af`;
    case 'distance':
      return `Leg ${goal} km af`;
    default:
      return `${goal} ${type}`;
  }
};

export default formatChallengeDescription;
