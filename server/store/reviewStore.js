
const reviews = [];

export const addReview = (review) => {
  const entry = {
    id: reviews.length + 1,
    ...review,
    reviewedAt: new Date().toISOString()
  };

  reviews.push(entry);
  return entry;
};

export const getReviews = (filters = {}) => {
  return reviews.filter((review) => {
    if (
      filters.clientId &&
      String(review.clientId) !== String(filters.clientId)
    ) return false;

    if (
      filters.planType &&
      review.planType !== filters.planType
    ) return false;

    return true;
  });
};

export const getLatestReview = (details) => {
  const matching = getReviews(details);
  return matching.length ? matching[matching.length - 1] : null;
};
