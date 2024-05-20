// utils/streakUtils.js

export const calculateStreak = (data) => {
  if (data.length === 0) {
    return { currentStreak: 0, visitDates: [] };
  }

  const visitDates = data.map(item => new Date(item.visited_at).toDateString());
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentVisit = new Date(visitDates[visitDates.length - 1]);

  // Check if the most recent visit was yesterday
  if (mostRecentVisit.toDateString() !== yesterday.toDateString() && mostRecentVisit.toDateString() !== today.toDateString()) {
    return { currentStreak: 0, visitDates: visitDates.reverse() };
  }

  let streak = 0;
  let lastDate = null;
  const currentStreakDates = [];

  // Iterate from the most recent visit to the earliest
  for (let i = visitDates.length - 1; i >= 0; i--) {
    const date = visitDates[i];
    if (!lastDate) {
      streak = 1;
      currentStreakDates.push(date);
    } else {
      const differenceInDays = (new Date(lastDate) - new Date(date)) / (1000 * 60 * 60 * 24);
      if (differenceInDays === 1) {
        streak++;
        currentStreakDates.push(date);
      } else {
        break; // If the dates are not consecutive, break the loop
      }
    }
    lastDate = date;
  }

  return { currentStreak: streak, visitDates: visitDates.reverse() }; // Reverse the visitDates array to maintain order
};


