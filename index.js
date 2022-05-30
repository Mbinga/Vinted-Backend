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

mongoose.connect("mongodb://localhost:27017/Vinted_Authentification");

cloudinary.config({
    cloud_name: "dmxaqz1mf",
    api_key: "824198692566523",
    api_secret: "2rJFkI3QsCa8b9wdEJp51q3KxQI",
});

app.listen(process.env.PORT, () => console.log("Server started"));

app.all("*", (req, res) => {
    res.status(404).send("Page introuvable");
});
