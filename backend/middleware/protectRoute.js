import User from "./../models/user.model.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

export const protectRoute = async (req, res, next) => {
  try {
    //Check if the token exists
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(404).json({ message: "You are not logged in!" });
    }
    //Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const currentUser = await User.findById(decoded.userId).select("-password");

    if (!currentUser) {
      return res
        .status(404)
        .json({ message: "The user belonging to this id no more exists" });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.log("Error in potect route middleware", err.message);
    res.status(404).json({});
  }
};
export default protectRoute;
