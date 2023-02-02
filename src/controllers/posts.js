import PostMessage from '../models/postMessage.js';
import { PAGE_LIMIT, RECOMMEND_LIMIT } from '../constants/limit.js';

// Router Handler Functions for the PostMessage Model

// Get all the posts and its total number
export const getPosts = async (req, res) => {
  try {
    // Get the current page from the request query string
    const { page } = req.query;

    // Calculate the starting index of the posts for the current page
    const startIndex = (Number(page) - 1) * PAGE_LIMIT;

    // Count the number of documents in the PostMessage model
    const total = await PostMessage.countDocuments({});
    
    // Find the posts for the current page and sort them from newest to oldest
    // TIP: Using lean() returns POJO, making queries faster and less memory intensive
    // TIP: Using exec() gives a fully-fledged promise and better stack traces
    const postMessages = await PostMessage.find().limit(PAGE_LIMIT).skip(startIndex).sort({ _id: -1 }).lean().exec();

    // Send the posts and its total as a JSON object to the client
    res.status(200).json({
      data: postMessages,
      num: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Get the post given the post id
export const getPost = async (req, res) => {
  try {
    // Get the post id from the request parameter
    const { id } = req.params;

    // Find the post with the given id
    const post = await PostMessage.findById(id).lean().exec();

    // Send the post as a JSON object to the client
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Get the post data given the post id and search up the other related posts
export const getPostDetails = async (req, res) => {
  try {
    // Get the post id from the request parameter
    const { id } = req.params;

    // Find the post with the given id but remove the 'likes' field
    const post = await PostMessage.findById(id, { likes: 0 }).lean().exec();
    
    // If the post has tags, find the recommended posts based on the tags
    if (post.tags.length) {
      const recommendedPosts = await PostMessage.aggregate([
        {
          $match: {
            tags: { $in: post.tags },  // should have at least one tag matched
            _id: { $ne: post._id }, // id should not match to remove duplicate
          },
        },
        {
          $project: {
            title: 1,
            selectedFile: 1,
            length: {
              $size: "$likes" // add a new field for the number of likes
            }
          }
        },
        { $sort: { length: -1 } }, // sort them by the number of likes
        { $limit: RECOMMEND_LIMIT }, // limit the size of the posts
      ]);

      // Send the post and the recommended posts back to the client
      return res.status(200).json({ post, recommends: recommendedPosts });
    }
    else {
      // Send the post back to the client
      return res.status(200).json({ post, recommends: {} });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Search the posts by the title and tags
export const getPostsBySearch = async (req, res) => {
  try {
    // Get the page number, search string, tags from the query string
    const { page, search, tags } = req.query;
    
    // Create filter object that will be used as condition to the queries
    const filter = {};
    // Specify the condition to match the search string 
    if (search) filter.title = new RegExp(search, 'i');
    // Specify the condition to include all the search tags
    if (tags) filter.tags = { $all: tags.split(',') };

    // Calculate the starting index of the posts for the current page
    const startIndex = (Number(page) - 1) * PAGE_LIMIT;

    // Count the number of documents with the conditions met
    const total = await PostMessage.countDocuments(filter);
    
    // Search the posts with the filter, limit the size of documents, and sort from newest to latest
    const postMessages = await PostMessage.find(filter).limit(PAGE_LIMIT).skip(startIndex).sort({ _id: -1 }).lean().exec();

    // Send the search results with the total back to the client
    res.status(200).json({
      data: postMessages,
      num: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Create a new post with the request body
export const createPost = async (req, res) => {
  try {
    // Get the new post data (client-side data) from the request body
    const post = req.body;

    // Create a new post for PostMessage model
    const newPost = new PostMessage(
      { ...post, creator: req.userId, createdAt: new Date().toISOString() }
    );
    
    // Save the document by inserting a new document into the database
    await newPost.save();
    
    // Send the server-side data back to the client
    res.status(201).json({ _id: newPost._id, creator: newPost.creator, createdAt: newPost.createdAt, likes: newPost.likes });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

// Search the post by id and update it with the new data
export const updatePost = async (req, res) => {
  try {
    // Get the post id from the request parameter
    const { id: _id } = req.params;
    // Get the new post data (client-side data) from the request body
    const newPost = req.body;

    // Find the record by id and update the it with the client side data
    await PostMessage.updateOne({ _id }, newPost).exec();

    // End the resposne without sending any data
    res.status(200).end(); 
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

// Search the post by id and delete it
export const deletePost = async (req, res) => {
  try {
    // Get the post id from the request parameter
    const { id: _id } = req.params;

    // Find and delete the record with the given id
    await PostMessage.deleteOne({ _id }).exec();

    // End the response without sending any data
    res.status(200).end();
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

// Find the post by id and update its likes field based on the like statu
export const likePost = async (req, res) => {
  try {
    // Get the post id from the request parameter
    const { id: _id } = req.params;

    // Find the post by id and select the likes field
    const response = await PostMessage.findById(_id, { likes: 1 }).lean().exec();
    // Check if the post exist; otherwise, send an error message
    if (response === null) return res.status(404).json({ message: "Id is not found" });

    // Copy the likes data into the new variable for updating
    let updatedLikes = response.likes;

    // Find if the post is already liked or not
    const index = updatedLikes.findIndex((id) => id === String(req.userId));
    // Add the user id to the new likes if the id does not exist in the likes field
    if (index === -1) {
      updatedLikes.push(req.userId);
    }
    // Remove the user id from the likes if the id already exist in the likes field
    else {
      updatedLikes = updatedLikes.filter((id) => id !== String(req.userId));
    }

    // Find the post with the given id and replace the likes field with the new likes data
    await PostMessage.updateOne({ _id }, { $set: { likes: updatedLikes }}).exec();

    // Send the updated likes data back to the client
    res.status(200).json(updatedLikes);
  }
  catch (error) {
    res.status(409).json({ message: error.message });
  }
}