import 'dotenv/config';
import jwt from 'jsonwebtoken';

// Middleware function to authenticate the user

// Define the secret/private key from dotenv
const privateKey = process.env.PRIVATEKEY || '';

// Check the user's log-in status
const authenticateUser = async (req, res, next) => {
  try {
    // Extract the token from the request header
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;
    let decodedData;

    // If the credential is not from the google, verify the token and attach the user id to the request
    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, privateKey);
      req.userId = decodedData?.id;
    }
    // If the credential is from the google, just decode the token and attach the user id to the request
    else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }
    
    // If the user id is not found, send back the error message
    if (!req.userId) return res.status(401).json({ message: "User unauthenticated. Please login." });

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.log(error);
  }
}

export default authenticateUser;