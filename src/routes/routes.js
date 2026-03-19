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


router.post("/createCracker", verifyToken,  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 }
  ]), crackerController.createCracker);

router.put("/updateCracker/:crackerId", verifyToken, upload.fields([
  { name: "image1" },
  { name: "image2" },
  { name: "image3" },
  { name: "image4" },
  { name: "image5" },
]), crackerController?.updateCracker);

router.get('/getProducts',verifyToken,crackerController.getProductList)

router.post("/createCategory", verifyToken, createCategory);
router.get("/getCategories", verifyToken, getCategories)

router.get("/getCrackers",crackerController?.getCrackers)
router.post("/genaratePdf",crackerController.generateOrderPDF)
router.get("/getOrdersReport",verifyToken,crackerController.getOrders)



module.exports = router;