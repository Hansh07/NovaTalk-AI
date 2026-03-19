const fs = require('fs');
const path = require('path');

const runTest = async () => {
  try {
    const connectDB = require('./config/db');
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    
    await connectDB();
    const user = await User.findOne();
    if (!user) {
      console.log('No users in DB to test auth!');
      process.exit(1);
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2024');

    fs.writeFileSync('test.txt', 'hello world');
    
    const fileStats = fs.statSync('test.txt');
    const fileStream = fs.createReadStream('test.txt');

    // To mock FormData in native fetch without external libraries, 
    // it's easier to just upload without FormData, but multer expects multipart/form-data.
    // Let's use standard node http request to correctly format a multipart/form-data
    
    const axios = require('axios'); // wait, axios is installed in server package.json! Wait. No, form-data was missing.
    // If form-data is missing, let's just use curl in a bash script!
  } catch (err) {
    console.error(err);
  }
};
runTest();
