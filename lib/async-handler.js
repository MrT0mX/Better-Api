module.exports = function asyncHandler(handler) {
  return function handleRequest(req, res, next) {
    try {
      const result = handler.call(this, req, res, next);
      if (result && typeof result.then === "function") {
        return Promise.resolve(result).catch(next);
      }
      return result;
    } catch (error) {
      return next(error);
    }
  };
};
