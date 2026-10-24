function createAdminGuard(findUser) {
  return async function requireAdmin(req, res, next) {
    if (!req.isAuthenticated?.() || !req.user?.id) {
      return res.redirect("/login");
    }

    try {
      const user = await findUser(req.user.id);
      if (!user || user.isAdmin !== true || user.isVerified !== true) {
        res.set("Cache-Control", "no-store");
        return res.status(403).send("Admin access required.");
      }
      if (user.adminMfaEnabled === true &&
          req.session?.adminMfaVerifiedUserId !== String(user._id || user.id)) {
        return req.logout((error) => {
          if (error) return next(error);
          return res.redirect("/login");
        });
      }
      req.adminUser = user;
      res.set("Cache-Control", "no-store, private");
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { createAdminGuard };
