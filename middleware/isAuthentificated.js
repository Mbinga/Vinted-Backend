const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
    if (req.headers.authorization) {
        const ntoken = req.headers.authorization.replace("Bearer ", "");
        const user = await User.findOne({
            token: ntoken,
        }).select("account _id");
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
        } else {
            req.user = user;
            return next();
        }
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = isAuthentificated;
