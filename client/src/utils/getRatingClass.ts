export default function getRatingClass(ratingValue: number) {
  // Round to nearest 0.5 to handle float values
  const roundedRating = Math.round(ratingValue * 2) / 2;

  switch (roundedRating) {
    case 0.5:
    case 1:
      return "ratingPoor";
    case 1.5:
    case 2:
    case 2.5:
    case 3:
      return "ratingFair";
    case 3.5:
    case 4:
    case 4.5:
    case 5:
      return "ratingGood";
    default:
      // Handle out-of-bounds values
      if (ratingValue < 1) return "ratingPoor";
      if (ratingValue > 5) return "ratingExcellent";
      return "ratingPoor";
  }
}
