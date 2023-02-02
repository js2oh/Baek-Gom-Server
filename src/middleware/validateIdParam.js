import mongoose from "mongoose";

// Middleware function to validate the MongoDB ID (unique 12 bytes ID)

// Validate if the given id is the correct MongoDB ID
const validateIdParam = async (req, res, next) => {
  // Get the id from the request parameter
  const { id: _id } = req.params;

  // Validate the id with isValid() and casting method
  if ((!mongoose.Types.ObjectId.isValid(_id)) && ((String)(new mongoose.Types.ObjectId(_id)) !== _id)) return res.status(404).json({ message: "Invalid MongoDB ObjectId" });
  
  // Proceed to the next middleware
  next();
}

export default validateIdParam;