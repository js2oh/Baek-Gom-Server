import PostMessage from '../models/postMessage.js';

// Middleware function that authorizes the user

// Check if the access to the resource is authorized
const authorizeUser = async (req, res, next) => {
  try {
    // Get the id from the request parameter
    const { id: _id } = req.params;

    // Find the post by the id and get creator data
    const response = await PostMessage.findById(_id, { creator: 1 }).lean().exec();
    // If the post is not found, send the error message
    if (response == null) return res.status(404).json({ message: "Id not found." });
    
    // Check if the user accessing the post and the owner of the post matches; otherwise, send error
    if (!req.userId || req.userId !== response.creator) return res.status(403).json({ message: "Unauthorized request." });

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.log(error);
  }
}

export default authorizeUser;