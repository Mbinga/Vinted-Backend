const express = require("express");
const router = express.Router();
const User = require("../models/User");
const formidable = require("express-formidable");
router.use(formidable());
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/user/signup", async (req, res) => {
    try {
        const checkemail = await User.findOne({ email: req.fields.email });
        if (!checkemail) {
            const newUser = new User({
                account: {
                    username: req.fields.username,
                },
                email: req.fields.email,
                password: req.fields.password,
                newsletter: req.fields.newsletter,
            });
            await newUser.save();
            const salt = uid2(16);
            const hash = SHA256(req.fields.password + salt).toString(encBase64);
            const token = uid2(64);
            newUser.salt = salt;
            newUser.hash = hash;
            newUser.token = token;
            await newUser.save();
            const resultclient = {
                _id: newUser.id,
                token: newUser.token,
                account: {
                    username: newUser.account.username,
                },
            };
            res.status(201).json(resultclient);
        } else {
            res.status(400).json({ error: "Email already exists !" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/user/login", async (req, res) => {
    try {
        const checkemail = await User.findOne({ email: req.fields.email });
        console.log(checkemail);
        if (checkemail) {
            const saltBDD = checkemail.salt;
            console.log("saltBDD =>", saltBDD);
            const checkpassword = req.fields.password;
            console.log("checkpassword =>", checkpassword);
            const checkhash = SHA256(checkpassword + saltBDD).toString(
                encBase64
            );
            console.log("checkhash =>", checkhash);
            if (checkhash === checkemail.hash) {
                const result = {
                    _id: checkemail.id,
                    token: checkemail.token,
                    account: {
                        username: checkemail.account.username,
                    },
                };
                res.status(200).json(result);
            } else {
                res.status(400).json({ error: "Wrong password" });
            }
        } else {
            res.status(400).json({ error: "This email doesn't exist." });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
