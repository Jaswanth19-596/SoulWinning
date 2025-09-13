const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('📊 ========================================');
    console.log('📊 CONNECTING TO MONGODB...');
    console.log(`📊 URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log('📊 ========================================');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log('📊 ========================================');
    console.log('✅ MONGODB CONNECTION SUCCESSFUL!');
    console.log(`✅ Connected to: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Connection state: ${conn.connection.readyState}`);
    console.log('📊 ========================================');
  } catch (error) {
    console.log('📊 ========================================');
    console.error('❌ MONGODB CONNECTION FAILED!');
    console.error('❌ Error:', error.message);
    if (error.code) console.error('❌ Error Code:', error.code);
    console.log('⚠️  SERVER WILL CONTINUE WITHOUT DATABASE');
    console.log('⚠️  Please check your MongoDB Atlas cluster status');
    console.log('⚠️  and network connectivity');
    console.log('📊 ========================================');

    // Don't exit - let server continue without DB for CORS testing
    // process.exit(1);
  }
};

module.exports = connectDB;