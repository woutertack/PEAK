import { differenceInDays, parseISO } from 'date-fns';

export const calculateStreak = (data) => {
  if (data.length === 0) {
    return { currentStreak: 0, visitDates: [] };
  }

  // Flatten the visit_times arrays and group by date
  const visitsByDate = {};
  data.forEach(item => {
    if (item.visit_times) {
      item.visit_times.forEach(visit => {
        const visitDate = new Date(visit).toDateString();
        if (!visitsByDate[visitDate]) {
          visitsByDate[visitDate] = new Set();
        }
        visitsByDate[visitDate].add(visit);
      });
    }
  });

  // Filter dates with at least 5 different locations
  const validVisitDates = Object.keys(visitsByDate)
    .filter(date => visitsByDate[date].size >= 5)
    .sort((a, b) => new Date(a) - new Date(b));

  if (validVisitDates.length === 0) {
    return { currentStreak: 0, visitDates: [] };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentVisit = new Date(validVisitDates[validVisitDates.length - 1]);

  // Check if the most recent visit was yesterday or today
  if (mostRecentVisit.toDateString() !== yesterday.toDateString() && mostRecentVisit.toDateString() !== today.toDateString()) {
    return { currentStreak: 0, visitDates: validVisitDates.reverse() };
  }

  let streak = 0;
  let lastDate = null;
  const currentStreakDates = [];

  // Iterate from the most recent visit to the earliest
  for (let i = validVisitDates.length - 1; i >= 0; i--) {
    const date = validVisitDates[i];
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

  return { currentStreak: streak, visitDates: validVisitDates.reverse() }; // Reverse the visitDates array to maintain order
};
