import React from 'react';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';


const CourseManagement = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Course Management
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Course management functionality is being developed. This will include:
            <ul>
              <li>Create and manage courses</li>
              <li>Assign faculty to courses</li>
              <li>Enroll students</li>
              <li>Set course schedules</li>
              <li>Manage course materials</li>
            </ul>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseManagement;

