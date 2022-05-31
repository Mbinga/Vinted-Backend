const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const formidable = require("express-formidable");
router.use(formidable());
const isAuthentificated = require("../middleware/isAuthentificated");
const cloudinary = require("cloudinary").v2;

//Route qui permet de publier une annonce, en checkant si le bon utilisateur est loggué à l'aide d'un middleware.

router.post("/offer/publish", isAuthentificated, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            brand,
            size,
            condition,
            color,
            city,
        } = req.fields;
        let pictureToUpload = req.files.picture.path;
        const result = await cloudinary.uploader.upload(pictureToUpload);

        Newoffer = await new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ÉTAT: condition },
                { COULEUR: color },
                { EMPLACEMENT: city },
            ],
            owner: req.user,
            product_image: {
                secure_url: result.secure_url,
            },
        });
        Newoffer.save();
        const moduser = req.user;
        moduser.account.avatar = { secure_url: result.secure_url };
        moduser.save();
        return res.json(Newoffer);
    } catch (error) {
        return res.json({ error: error.message });
    }
});

//Route qui permet de récupérer un tableau avec tous les offres,en fonction des filtres demandés.

router.get("/offers", async (req, res) => {
    try {
        let { title, priceMin, priceMax, sort, page } = req.query;
        if (!priceMin) {
            priceMin = 0;
        }
        if (!priceMax) {
            priceMax = 10000;
        }
        if (!page) {
            page = 1;
        }
        const NbOfOfferPerPage = 2;
        const skipPage = NbOfOfferPerPage * page - NbOfOfferPerPage;
        if (sort === "price-desc") {
            const result = await Offer.find({
                product_name: new RegExp(title, "i"),
                product_price: {
                    $gte: Number(priceMin),
                    $lte: Number(priceMax),
                },
            })
                .sort({
                    product_name: "desc",
                })
                .populate({
                    path: "owner",
                    select:
                        ("account.username", "id", "account.avatar.secure_url"),
                })
                .skip(skipPage)
                .limit(NbOfOfferPerPage);
            res.status(200).json(result);
        } else if (sort === "price-asc") {
            const result = await Offer.find({
                product_name: new RegExp(title, "i"),
                product_price: {
                    $gte: Number(priceMin),
                    $lte: Number(priceMax),
                },
            })
                .sort({
                    product_name: "asc",
                })
                .populate({
                    path: "owner",
                    select: "id account.username account.avatar.secure_url",
                })
                .skip(skipPage)
                .limit(NbOfOfferPerPage);
            res.status(200).json({ count: result.length, offers: result });
        } else {
            res.status(400).json({ error: "Filter not good." });
        }
    } catch (error) {
        return res.json({ error: error.message });
    }
});

//Route qui affiche une offre détaillée, en fonction de son id.

router.get("/offerbyid/:id", async (req, res) => {
    try {
        const result = await Offer.findById(req.params.id)
            .select(
                "product_image.secure_url product_details product_price product_name product_description product_picture "
            )
            .populate({
                path: "owner",
                select: "id account.username account.avatar.secure_url",
            });
        res.status(200).json(result);
    } catch (error) {
        return res.json({ error: error.message });
    }
});

module.exports = router;
