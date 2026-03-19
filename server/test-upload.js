const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const testUpload = async () => {
  try {
    // 1. Get a fresh token by logging in (assuming there's a test user, but we can't easily guess passwords).
    // Let's just create a mock user and generate a token directly via DB!
    const connectDB = require('./config/db');
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    
    await connectDB();
    const user = await User.findOne();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2024');

    // 2. Upload a file
    fs.writeFileSync('test-image.jpg', 'fake image content');
    const form = new FormData();
    form.append('file', fs.createReadStream('test-image.jpg'));

    console.log('Hitting /api/upload...');
    const res = await axios.post('http://localhost:5000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Success!', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response Error:', err.response.status, err.response.data);
    } else {
      console.error('Network Error:', err.message);
    }
  } finally {
    if (fs.existsSync('test-image.jpg')) fs.unlinkSync('test-image.jpg');
    process.exit(0);
  }
};

testUpload();
