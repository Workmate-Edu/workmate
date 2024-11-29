import mongoose from 'mongoose';
import User from '../src/models/user.model';
import connectDB from '../src/lib/mongodb';

async function generateUsernames() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all users without usernames
    const users = await User.find({ username: { $exists: false } });
    console.log(`Found ${users.length} users without usernames`);

    for (const user of users) {
      // Generate base username from name
      let baseUsername = user.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

      // Try to find a unique username
      let username = baseUsername;
      let counter = 1;
      
      while (true) {
        // Check if username exists
        const existingUser = await User.findOne({ username });
        
        if (!existingUser || existingUser._id.equals(user._id)) {
          break;
        }
        
        // If username exists, append number and try again
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Update user with new username
      await User.updateOne(
        { _id: user._id },
        { $set: { username } }
      );
      
      console.log(`Updated user ${user.name} with username: ${username}`);
    }

    console.log('Username generation complete');
    process.exit(0);
  } catch (error) {
    console.error('Error generating usernames:', error);
    process.exit(1);
  }
}

generateUsernames();
