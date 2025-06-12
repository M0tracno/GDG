// Test script to check if the API URL is properly defined in the frontend
console.log('Checking API URL environment variable:');
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Using the default URL:', `${process.env.REACT_APP_API_URL || ''}/api/admin/auth/create-user`);




