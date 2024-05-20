// utils/calculateMaxStreak.js

export const calculateMaxStreak = (data) => {
  if (data.length === 0) {
    return 0;
  }

  const visitDates = data.map(item => new Date(item.visited_at).toDateString());
  let maxStreak = 0;
  let streak = 0;
  let lastDate = null;

  for (let i = 0; i < visitDates.length; i++) {
    const date = new Date(visitDates[i]);

    if (!lastDate) {
      streak = 1;
    } else {
      const differenceInDays = (date - new Date(lastDate)) / (1000 * 60 * 60 * 24);

      if (differenceInDays === 1) {
        streak++;
      } else if (differenceInDays > 1) {
        streak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, streak);
    lastDate = date;
  }

  return maxStreak;
};
