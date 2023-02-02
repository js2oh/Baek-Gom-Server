import mongoose from 'mongoose';

// Define Schema for the post data
const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String,
  tags: [String],
  selectedFile: String,
  likes: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

// Create a model by converting the Schema into a Model
const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;