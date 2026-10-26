import jsonwebtoken from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const error = new Error("Authorization failed!");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    const error = new Error("Invalid authorization header");
    error.statusCode = 401;
    return next(error);
  }

  let decoded;
  try {
    decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(error);
  }

  req.user = decoded;
  next();
};
