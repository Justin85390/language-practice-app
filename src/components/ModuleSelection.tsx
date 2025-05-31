import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Module, Course } from '../utils/courseData';

interface ModuleSelectionProps {
  modules: Module[];
  onSelectCourse: (course: Course) => void;
  onSelectModule: (module: Module) => void;
}

export default function ModuleSelection({ modules, onSelectCourse, onSelectModule }: ModuleSelectionProps) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {modules.map((module) => (
        <Accordion key={module.id} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              '& .MuiAccordionSummary-content': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {module.title}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelectModule(module);
              }}
              sx={{ ml: 2 }}
            >
              Practice Full Module
            </Button>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {module.courses.map((course) => (
                <ListItem
                  key={course.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={course.title}
                    secondary={
                      course.targetLanguage && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Target Language:
                          </Typography>
                          {course.targetLanguage.map((tl, index) => (
                            <Paper key={index} sx={{ p: 1, mb: 1, bgcolor: 'grey.50' }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {tl.category}:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                {tl.expressions.map((expr, i) => (
                                  <Chip
                                    key={i}
                                    label={expr}
                                    size="small"
                                    variant="outlined"
                                    sx={{ bgcolor: 'background.paper' }}
                                  />
                                ))}
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      )
                    }
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => onSelectCourse(course)}
                    sx={{ ml: 2, whiteSpace: 'nowrap' }}
                  >
                    Practice Course
                  </Button>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 