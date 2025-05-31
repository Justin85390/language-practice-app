'use client';

import { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { WELCOMING_VISITORS_B1 } from '@/utils/courseData';

export default function Practice() {
  const [currentModule] = useState(WELCOMING_VISITORS_B1.modules[0]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {WELCOMING_VISITORS_B1.skill} - {WELCOMING_VISITORS_B1.level}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {currentModule.title}
        </Typography>
        <Box sx={{ mt: 4 }}>
          {currentModule.courses.map((course) => (
            <Box key={course.id} sx={{ mb: 2 }}>
              <Typography variant="h6">
                {course.title}
              </Typography>
              {course.targetLanguage && course.targetLanguage.map((lang, index) => (
                <Box key={index} sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {lang.category}
                  </Typography>
                  {lang.expressions.map((expr, i) => (
                    <Typography key={i} sx={{ ml: 2 }}>
                      • {expr}
                    </Typography>
                  ))}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
} 