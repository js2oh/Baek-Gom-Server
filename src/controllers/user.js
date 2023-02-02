import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

import { expirePeriod } from '../constants/jwtConstants.js';

// Router Handler Functions for the User Model

// Get the secret/private key from dotenv
const privateKey = process.env.PRIVATEKEY || '';

// Handle signin (authentication) process and generate JSON Web Token
export const signin = async (req, res) => {
  try {
    // Get email and password data from the request body
    const { email, password } = req.body;

    // Check if the User record exists given an email address; otherwise, send back an error
    const foundUser = await User.findOne({ email: email }).lean().exec();
    if (!foundUser) return res.status(404).json({ message: "Invalid Credentials." });
    
    // Compare the password from the client-side and the password hashed from the database with bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
    // Check the password is correct; otherwise, send back an error
    if (!isPasswordCorrect) return res.status(404).json({ message: "Invalid Credentials."});

    // Sign the user's credential data with HMAC SHA256 algorithm and the private key
    // Generate token and send back the token with the user credential retrieved from the database
    const token = jwt.sign({ email: foundUser.email, id: foundUser._id}, privateKey, { expiresIn: expirePeriod });
    res.status(200).json({ result: foundUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
}

// Handle signup process and create a new user
export const signup = async (req, res) => {
  try {
    // Get the user credential data from the request body
    const { email, password, firstName, lastName, confirmPassword } = req.body;

    // Check if the User record already exists given an email address; otherwise, send back an error
    const userFound = await User.exists({ email: email }).exec();
    if (userFound) return res.status(404).json({ message: "User already exists." });

    // Check if the password and the confirmPassword match; otherwise, send back an error
    if (password !== confirmPassword) return res.status(404).json({ message: "Passwords don't match." });

    // Add the first name and the last name together into the full name
    const name = `${firstName} ${lastName}`;

    // Generate salt and hash a password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User record with name, email, and hashedPassword and save it
    const newUser = new User(
      { name, email, password: hashedPassword }
    );
    await newUser.save();

    // Sign the user's credential data with HMAC SHA256 algorithm and the private key
    // Generate token and send back the token with the user credential to the client
    const token = jwt.sign({ email: newUser.email, id: newUser._id}, privateKey, { expiresIn: expirePeriod });
    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
}