import { 
  AcUnit,
  SentimentVerySatisfied,
  FavoriteBorder,
  Groups,
  School,
} from '@mui/icons-material';

// Helper function to check lesson completion and get best score
export const getLessonStatus = (lesson) => {
  const previousProgress = lesson.previous_progress || [];
  const thresholdScore = lesson.threshold_score || 0;
  
  if (previousProgress.length === 0) {
    return { isCompleted: false, bestScore: null, attempts: 0 };
  }
  
  const scores = previousProgress.map(attempt => attempt.score || 0);
  const bestScore = Math.max(...scores);
  const isCompleted = bestScore >= thresholdScore;
  
  return { isCompleted, bestScore, attempts: previousProgress.length };
};

// Get category-specific visuals and theming
export const getCategoryVisuals = (categoryName = '', theme) => {
  const lowerName = categoryName.toLowerCase();

  switch (true) {
    case lowerName.includes('icebreaker'):
      return {
        icon: <AcUnit sx={{ fontSize: 24 }} />,
        color: theme.palette.info.main,
        bgColor: theme.palette.info.light + '20'
      };
    case lowerName.includes('humor'):
      return {
        icon: <SentimentVerySatisfied sx={{ fontSize: 24 }} />,
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light + '20'
      };
    case lowerName.includes('empathy'):
      return {
        icon: <FavoriteBorder sx={{ fontSize: 24 }} />,
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light + '20'
      };
    case lowerName.includes('engagement'):
      return {
        icon: <Groups sx={{ fontSize: 24 }} />,
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light + '20'
      };
    default:
      return {
        icon: <School sx={{ fontSize: 24 }} />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.primary.light + '20'
      };
  }
};

// Calculate scenario progress statistics
export const calculateScenarioStats = (scenarios) => {
  // Only include lessons that have been attempted
  const attemptedScenarios = scenarios.filter(s => getLessonStatus(s).attempts > 0);
  
  const completed = attemptedScenarios.filter(s => getLessonStatus(s).isCompleted).length;
  const totalAttempts = attemptedScenarios.reduce((sum, s) => sum + getLessonStatus(s).attempts, 0);
  const averageScore = attemptedScenarios.length > 0 
    ? attemptedScenarios.reduce((sum, s) => {
        const { bestScore } = getLessonStatus(s);
        return sum + (bestScore || 0);
      }, 0) / attemptedScenarios.length
    : 0;

  return { 
    completed, 
    total: attemptedScenarios.length, 
    totalAttempts, 
    averageScore: Math.round(averageScore),
    totalAvailable: scenarios.length // Keep track of total available lessons
  };
}; 