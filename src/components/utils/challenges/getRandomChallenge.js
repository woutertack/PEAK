// src/utils/getRandomChallenge.js

const challengeTemplates = [
  {
    challenge_type: 'steps',
    goalRange: [2000, 4000],
  },
  {
    challenge_type: 'distance',
    goalRange: [1, 3], // in kilometers
  },
  {
    challenge_type: 'hexagons',
    goalRange: [1, 3],
  },
];

const getRandomChallenge = (type, levelMultiplier) => {
  const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
  const challenge = challengeTemplates[randomIndex];
  const baseGoal = Math.floor(Math.random() * (challenge.goalRange[1] - challenge.goalRange[0] + 1)) + challenge.goalRange[0];
  let goal = baseGoal * levelMultiplier;

  if (type === 'weekly') {
    goal *= 4;
  } else if (type === 'monthly') {
    goal *= 10;
  }

  const creationTime = new Date();
  creationTime.setHours(0, 0, 0, 0); // Set time to midnight
  const creationTimeISO = creationTime.toISOString();

  return {
    challenge_type: challenge.challenge_type,
    goal,
    creation_time: creationTimeISO,
    type,
    completed: false,
  };
};

export default getRandomChallenge;
