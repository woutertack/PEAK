export const calculateMaxStreak = (data) => {
  if (data.length === 0) {
    return 0;
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
    return 0;
  }

  let maxStreak = 0;
  let streak = 0;
  let lastDate = null;

  // Iterate through the valid visit dates to calculate the max streak
  for (let i = 0; i < validVisitDates.length; i++) {
    const date = new Date(validVisitDates[i]);

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
