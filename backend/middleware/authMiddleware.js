import jwt from "jsonwebtoken";

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
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      const authError = new Error("Invalid or expired token");
      authError.statusCode = 401;
      return next(authError);
    }

    return next(error);
  }

  req.user = decoded;
  next();
};
