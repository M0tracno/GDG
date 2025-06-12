import React from 'react';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';


const CommunicationCenter = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Communication Center
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Communication center is under development. This will include:
            <ul>
              <li>Send announcements to all users</li>
              <li>Email notifications</li>
              <li>SMS alerts</li>
              <li>Message templates</li>
              <li>Communication history</li>
            </ul>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CommunicationCenter;

