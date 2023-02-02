import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './routes/posts.js';
import userRoutes from './routes/user.js';

// Create an Express application for routing HTTP requests and configuring middlewares
const app = express();

// Read .env file from the root directory, parse the contents, and assign it to process.env
dotenv.config();

// Enable Cross-Origin Resource Sharing which makes the server accessible by other domains
app.use(cors());

// Parse the data (the body of the request) into the req.body to enable form data
app.use(bodyParser.json({ limit: "30mb" }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Set the value of the port
const PORT = process.env.PORT || 5000;

// To test that the server is running
app.get("/", (req, res) => {
  res.send("APP IS RUNNING");
});

// Connect to the mongoDB database and start running the server
mongoose.connect(process.env.CONNECTION_URL)
  .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
  .catch((error) => console.log(`${process.env.CONNECTION_URL} ${error.message}`));

// Handles all requests to /posts/* and /user/* using the router objects
app.use("/posts", postRoutes);
app.use("/user", userRoutes);
