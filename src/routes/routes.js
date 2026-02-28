const express = require("express")
const router = express.Router();
const { createSeller, loginSeller, logoutSeller, verifyUser } = require("../controllers/sellerController")
const crackerController = require("../controllers/crackerController");
const { createCategory, getCategories } = require("../controllers/categroyController")
const { verifyToken } = require("../utils/jwtToken")
const upload = require("../middleware/upload");

router.get("/", (req, res) => {
    res.send("node js running from router")
})

router.post("/createSeller", createSeller);
router.post("/loginSeller", loginSeller);
router.post("/logoutSeller", verifyToken, logoutSeller);
router.get("/verifySeller", verifyToken, verifyUser);


router.post("/createCracker",  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImage", maxCount: 1 }
]), crackerController.createCracker);
router.put("/update/:crackerId", verifyToken, crackerController.updateCracker);

router.post("/createCategory", verifyToken, createCategory);
router.get("/getCategories", verifyToken, getCategories)



module.exports = router;