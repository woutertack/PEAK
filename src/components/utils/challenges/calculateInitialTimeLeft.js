const calculateInitialTimeLeft = (creationTime, type) => {
  const now = new Date();
  const creationDate = new Date(creationTime);
  
  let totalTime;

  switch (type) {
    case 'daily':
      const endOfDay = new Date(creationDate);
      endOfDay.setTime(endOfDay.getTime() + 24 * 60 * 60 * 1000); // Set time to 24 hours from creation time
      totalTime = endOfDay.getTime() - now.getTime();
      break;
    case 'weekly':
      const endOfWeek = new Date(creationDate);
      endOfWeek.setDate(creationDate.getDate() + 7); // 7 days from creation time
      totalTime = endOfWeek.getTime() - now.getTime();
      break;
    case 'monthly':
      const endOfMonth = new Date(creationDate);
      endOfMonth.setMonth(creationDate.getMonth() + 1); // 1 month from creation time
      totalTime = endOfMonth.getTime() - now.getTime();
      break;
    default:
      totalTime = 0;
  }

  const hours = Math.floor(totalTime / (1000 * 60 * 60));
  const minutes = Math.floor((totalTime / (1000 * 60)) % 60);
  const seconds = Math.floor((totalTime / 1000) % 60);

  if (type === 'daily') {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (type === 'weekly' || type === 'monthly') {
    const days = Math.floor(totalTime / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h`;
  }
};

export default calculateInitialTimeLeft;
