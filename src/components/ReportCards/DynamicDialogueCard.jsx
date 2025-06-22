import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Avatar,
  Box,
  LinearProgress,
  Zoom,
} from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const DynamicDialogueCard = ({ reportCard, index, onReportClick }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Zoom in timeout={300 + index * 100}>
        <Card
          variant="outlined"
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${theme.palette.primary.main}33`,
            },
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <CardActionArea onClick={() => onReportClick(reportCard.session_id)}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: reportCard.total_score >= 70 ? theme.palette.success.main : 
                             reportCard.total_score >= 40 ? theme.palette.warning.main : theme.palette.error.main,
                    mr: 2,
                  }}
                >
                  <Assessment />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Report #{index + 1}
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                {reportCard.total_score}
                <span style={{ fontSize: '1rem', color: theme.palette.text.secondary }}>
                  /100
                </span>
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={reportCard.total_score || 0}
                  color={
                    reportCard.total_score >= 70
                      ? 'success'
                      : reportCard.total_score >= 40
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Typography variant="body2" sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.secondary',
                lineHeight: 1.4,
              }}>
                {reportCard.feedback || 'No feedback provided yet.'}
              </Typography>
              
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.primary.main}`,
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}08`,
                  }
                }}
              >
                View Full Report
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Zoom>
    </Grid>
  );
};

export default DynamicDialogueCard; 