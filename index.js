const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const Userroutes = require("./routes/user");
const Offerroutes = require("./routes/offer");
const app = express();
const cloudinary = require("cloudinary").v2;
const isAuthentificated = require("./middleware/isAuthentificated");
const cors = require("cors");
app.use(cors());
require("dotenv").config();
app.use(formidable());
app.use(Offerroutes);
app.use(Userroutes);

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => console.log("Server started"));

app.all("*", (req, res) => {
    res.status(404).send("Page introuvable");
});
