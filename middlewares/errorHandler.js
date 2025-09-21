const errorHandler = (err, _req, res, _next) => {
  console.error(err); // zeigt auch Stacktrace im Terminal

  const status = err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
