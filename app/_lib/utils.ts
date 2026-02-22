export const percentageChangeCalculator = ({
  current,
  previous,
}: {
  current: number | null;
  previous: number | null;
}) => {
  if (!previous || current === null) {
    return null;
  }
  return ((current - previous) / previous) * 100;
};

export const percentageToGoalCalculator = ({
  revenue,
  target,
}: {
  revenue: number | null;
  target: number | null;
}) => {
  if (!target || revenue === null) {
    return null;
  }
  return +(((revenue - target) / target) * 100).toFixed(2);
};

/**
 * Calculate the percentage of goal achievement
 * given a revenue and a target
 * @param {Object} params - Object containing revenue and target
 * @param {number | null} params.revenue - Revenue value
 * @param {number | null} params.target - Target value
 * @returns {number | null} - Percentage of goal achievement
 */
export const percentageGoalAchievementCalculator = ({
  revenue,
  target,
}: {
  revenue: number | null;
  target: number | null;
}) => {
  if (!target || revenue === null) {
    return null;
  }
  return +((revenue / target) * 100).toFixed(2);
};
