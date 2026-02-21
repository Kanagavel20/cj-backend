const Seller = require("../models/sellers");
const bcrypt = require("bcryptjs");
const { getResponse } = require("../constants/constants");
const { generateToken } = require("../utils/jwtToken");


const generateSellerId = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let isUnique = false;
    let sellerId;

    while (!isUnique) {
        let randomPart = "";

        for (let i = 0; i < 8; i++) {
            randomPart += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        sellerId = "CJ" + randomPart;

        const existing = await Seller.findOne({ sellerId });
        if (!existing) {
            isUnique = true;
        }
    }

    return sellerId;
};


exports.createSeller = async (req, res) => {
    try {
        const { name, email, password, couponCode } = req.body;


        if (!name || !email || !password || !couponCode) {
            return getResponse(res, "All fields are required", "", "error");
        }


        if (name.length < 3) {
            return getResponse(res, "Name must be grater than three characters", "", "error");
        } else if (name.length > 40) {
            return getResponse(res, "Name must be less than 40 characters", "", "error");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return getResponse(res, "Invalid email format", "", "error");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{10,}$/;

        if (!passwordRegex.test(password)) {
            return getResponse(res,
                "Password must be at least 10 characters and include uppercase, lowercase, and special character",
                "", "error"
            );
        }

        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return getResponse(res, "Seller already exists with this email", "", "error");
        }

        const existingCoupon = await Seller.findOne({ couponCode });
        if (existingCoupon) {
            return getResponse(res, "Coupon code already in use", "", "error");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sellerId = await generateSellerId();

        const seller = await Seller.create({
            sellerId,
            name,
            email,
            password: hashedPassword,
            couponCode,
            type: "Seller"
        });
        console.log('sleeo', seller)

        return getResponse(res, "Seller created successfully", { seller }, "success");

    } catch (error) {
        console.log("error", error)
        return getResponse(res, "Internal server error", "", "");
    }
};



exports.loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return getResponse(res, "Email and password are required", "", "error");
        }

        const seller = await Seller.findOne({ email });
        console.log("isMatch", seller)
        if (!seller) {
            return getResponse(res, "Invalid email or password", "", "error");
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return getResponse(res, "Invalid email or password", "", "error");
        }

        // Generate token
        const token = generateToken({ id: seller._id, email: seller.email, type: seller.type });
        seller.token = token;
        seller.isLoggedIn = true;
        await seller.save();


        return getResponse(
            res,
            "Login successful",
            {
                token,
                id: seller._id,
                name: seller.name,
                email: seller.email,
                couponCode: seller.couponCode
            },
            "success"
        );

    } catch (error) {
        console.log("login error", error);
        return getResponse(res, "Internal server error", "", "error");
    }
};


exports.logoutSeller = async (req, res) => {
    try {
        const sellerId = req.user.id;

        await Seller.findByIdAndUpdate(sellerId, {
            token: null,
            isLoggedIn: false
        });

        return getResponse(res, "Logout successful", "", "success");

    } catch (error) {
        console.log("logout error", error);
        return getResponse(res, "Internal server error", "", "error");
    }
};

exports.verifyUser = async (req, res) => {
  try {

    const sellerId = req.user.id;

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return getResponse(res, "Token missing", "", "error");
    }

    const providedToken = authHeader.split(" ")[1];

    // Find seller
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return getResponse(res, "Invalid token", "", "error");
    }

    // Compare token with DB token
    if (seller.token !== providedToken) {
      return getResponse(res, "Invalid token", "", "error");
    }

    return getResponse(res, "Token valid", seller, "success");

  } catch (error) {
    console.log(error);
    return getResponse(res, "Token invalid", "", "error");
  }
};