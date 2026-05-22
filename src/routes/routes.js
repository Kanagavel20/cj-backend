/**
 * @swagger
 * tags:
 *   - name: Seller
 *     description: Seller authentication and profile operations
 *   - name: Cracker
 *     description: Cracker product, PDF, and report operations
 *   - name: Category
 *     description: Category creation and listing operations
 */

const express = require("express")
const router = express.Router();
const { createSeller, loginSeller, logoutSeller, verifyUser,getSellers } = require("../controllers/sellerController")
const crackerController = require("../controllers/crackerController");
const { createCategory, getCategories } = require("../controllers/categroyController")
const { verifyToken } = require("../utils/jwtToken")
const upload = require("../middleware/upload");

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Seller]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/", (req, res) => {
    res.send("node js running from router")
})

/**
 * @swagger
 * /createSeller:
 *   post:
 *     tags: [Seller]
 *     summary: Create a new seller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller created successfully
 */
router.post("/createSeller", createSeller);

/**
 * @swagger
 * /getSellers:
 *   get:
 *     tags: [Seller]
 *     summary: Get all sellers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller list returned
 */
router.get("/getSellers",verifyToken,getSellers)

/**
 * @swagger
 * /loginSeller:
 *   post:
 *     tags: [Seller]
 *     summary: Login a seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/loginSeller", loginSeller);

/**
 * @swagger
 * /logoutSeller:
 *   post:
 *     tags: [Seller]
 *     summary: Logout the current seller
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logoutSeller", verifyToken, logoutSeller);

/**
 * @swagger
 * /verifySeller:
 *   get:
 *     tags: [Seller]
 *     summary: Verify seller authentication token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 */
router.get("/verifySeller", verifyToken, verifyUser);

/**
 * @swagger
 * /createCracker:
 *   post:
 *     tags: [Cracker]
 *     summary: Create a new cracker product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image1:
 *                 type: string
 *                 format: binary
 *               image2:
 *                 type: string
 *                 format: binary
 *               image3:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Cracker created successfully
 */
router.post("/createCracker", verifyToken,  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 }
  ]), crackerController.createCracker);

/**
 * @swagger
 * /updateCracker/{crackerId}:
 *   put:
 *     tags: [Cracker]
 *     summary: Update cracker product details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: crackerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image1:
 *                 type: string
 *                 format: binary
 *               image2:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cracker updated successfully
 */
router.put("/updateCracker/:crackerId", verifyToken, upload.fields([
  { name: "image1" },
  { name: "image2" },
  { name: "image3" },
  { name: "image4" },
  { name: "image5" },
]), crackerController?.updateCracker);

/**
 * @swagger
 * /getProducts:
 *   get:
 *     tags: [Cracker]
 *     summary: Get product list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list returned
 */
router.get('/getProducts',verifyToken,crackerController.getProductList)

/**
 * @swagger
 * /createCategory:
 *   post:
 *     tags: [Category]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post("/createCategory", verifyToken, createCategory);

/**
 * @swagger
 * /getCategories:
 *   get:
 *     tags: [Category]
 *     summary: Get category list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category list returned
 */
router.get("/getCategories", verifyToken, getCategories)

/**
 * @swagger
 * /api/crackers:
 *   get:
 *     summary: Get all crackers
 *     tags: [Crackers]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [english, tamil]
 *         required: false
 *         description: Language selection
 *     responses:
 *       200:
 *         description: Crackers fetched successfully
 */
router.get("/getCrackers",crackerController?.getCrackers)

/**
 * @swagger
 * /genaratePdf:
 *   post:
 *     tags: [Cracker]
 *     summary: Generate an order PDF
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: PDF generated successfully
 */
router.post("/genaratePdf",crackerController.generateOrderPDF)

/**
 * @swagger
 * /getOrdersReport:
 *   get:
 *     tags: [Cracker]
 *     summary: Get orders report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders report returned
 */
router.get("/getOrdersReport",verifyToken,crackerController.getOrders)


module.exports = router;