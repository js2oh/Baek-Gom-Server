import mongoose from 'mongoose';

// Define Schema for the user data
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Create a model by converting the Schema into a Model
const User = mongoose.model('User', userSchema);

export default User;