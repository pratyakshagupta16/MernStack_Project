module.exports = function shouldRepeatToday(schedule) {
  if (!schedule || !schedule.repeat) return true;

  if (schedule.repeat === 'daily') return true;
  if (schedule.repeat === 'none') return false;
  if (Array.isArray(schedule.repeat)) {
    const days = ['sun','mon','tue','wed','thu','fri','sat'];
    const today = days[new Date().getDay()];
    return schedule.repeat.includes(today);
  }
  return true;
};
