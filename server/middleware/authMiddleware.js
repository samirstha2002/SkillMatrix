import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    //check header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized,no token" });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //get user from Db (imp no password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    //attach user to request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized,token failed",
    });
  }
};

export default authMiddleware;
