const calculateTime = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate - now;

  if (timeDiff <= 0) {
    return "Time's up!";
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
  
  return `${days}d ${hours}h ${minutes}m`;
};


export default calculateTime;