export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); 
    }
    res.redirect('/login'); 
};

export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin"){
        return next()
    }
    res.status(403).send("Access denied: admins only.")
}