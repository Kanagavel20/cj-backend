const Cracker = require("../models/cracker");
const Seller = require("../models/sellers");
const { getResponse } = require("../constants/constants");


// exports.createCracker = async (req, res) => {
//     try {
//         const sellerId = req.user.id;

//         const seller = await Seller.findById(sellerId);
//         if (!seller) {
//             return getResponse(res, "Seller not found", "", "error");
//         }

//         const {
//             crackerNameEnglish,
//             crackerNameTamil,
//             originalPrice,
//             discountPrice,
//             discountPercentage,
//             mainImage,
//             subImages,
//             youtubeLink,
//             instagramLink
//         } = req.body;

//         const cracker = await Cracker.create({
//             crackerNameEnglish,
//             crackerNameTamil,
//             originalPrice,
//             discountPrice,
//             discountPercentage,
//             mainImage,
//             subImages,
//             youtubeLink,
//             instagramLink,
//             createdBy: seller.name
//         });

//         return getResponse(res, "Cracker created", cracker, "success");

//     } catch (error) {
//         console.log(error);
//         return getResponse(res, "Internal server error", "", "error");
//     }
// };

exports.createCracker = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return getResponse(res, "Seller not found", "", "error");
    }

    const {
      category,
      crackerNameEnglish,
      crackerNameTamil,
      originalPrice,
      discountPrice,
      stockStatus,
      youtubeLink,
      instagramLink,
      duration,
      soundLevel,
      safety
    } = req.body;

    // Convert prices to number (important)
    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (!req.files ||
      (!req.files.image1 &&
        !req.files.image2 &&
        !req.files.image3 &&
        !req.files.image4 &&
        !req.files.image5)) {
      return getResponse(res, "At least one image is required", "", "error");
    }
    if (discount > original) {
      return getResponse(res, "Discount price cannot be greater than original price", "", "error");
    }

    const image1 = req.files?.image1?.[0]?.path || null;
    const image2 = req.files?.image2?.[0]?.path || null;
    const image3 = req.files?.image3?.[0]?.path || null;
    const image4 = req.files?.image4?.[0]?.path || null;
    const image5 = req.files?.image5?.[0]?.path || null;

    const discountPercentage =
      ((original - discount) / original) * 100;

    const cracker = await Cracker.create({
      category,
      crackerNameEnglish,
      crackerNameTamil,
      originalPrice: original,
      discountPrice: discount,
      discountPercentage: Math.round(discountPercentage),
      stockStatus,
      youtubeLink: youtubeLink ?? "",
      instagramLink: instagramLink ?? "",
      duration,
      soundLevel,
      safety,
      image1,
      image2,
      image3,
      image4,
      image5,
      createdBy: seller.name,
      lastUpdatedBy: seller.name
    });

    return getResponse(res, "Cracker created successfully", cracker, "success");

  } catch (error) {
    console.log(error);
    return getResponse(res, error.message, "", "error");
  }
};

exports.getProductList = async (req, res) => {
  try {

    const crackers = await Cracker.find()
      .populate({
        path: "category",
        model: "Category",
        select: "categoryNameEnglish"
      })
      .lean(); // faster

    const groupedData = {};

    crackers.forEach((cracker) => {

      // if category not found skip
      if (!cracker.category) return;

      const categoryId = cracker.category._id.toString();
      const categoryName = cracker.category.categoryNameEnglish;
      const crackerId = cracker._id?.toString()

      if (!groupedData[categoryId]) {
        groupedData[categoryId] = {
          name: categoryName,
          subCategories: []
        };
      }

      groupedData[categoryId].subCategories.push({
        crackerId,
        crackerNameEnglish: cracker.crackerNameEnglish,
        crackerNameTamil: cracker.crackerNameTamil,
        image1: cracker.image1,
        image2: cracker.image2,
        image3: cracker.image3,
        image4: cracker.image5,
        image4: cracker.image5,
        originalPrice: cracker.originalPrice,
        discountPrice: cracker.discountPrice,
        discountPercentage: cracker.discountPercentage,
        stockStatus: cracker.stockStatus,
        disabled: cracker.stockStatus === "Out of Stock",
        youtubeLink: cracker.youtubeLink,
        duration:cracker.duration,
        safety:cracker.safety,
        soundLevel:cracker.soundLevel,
        instagramLink: cracker.instagramLink,
      });
    });

    const productList = Object.values(groupedData);

    return getResponse(res, "Product list fetched", productList, "success");

  } catch (error) {
    console.log(error);
    return getResponse(res, "Internal server error", "", "error");
  }
};


exports.updateCracker = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { crackerId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return getResponse(res, "Seller not found", "", "error");
    }

    const existingCracker = await Cracker.findById(crackerId);
    if (!existingCracker) {
      return getResponse(res, "Cracker not found", "", "error");
    }

    const {
      category,
      crackerNameEnglish,
      crackerNameTamil,
      originalPrice,
      discountPrice,
      stockStatus,
      youtubeLink,
      instagramLink,
      duration,
      soundLevel,
      safety,
    } = req.body;

    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (discount > original) {
      return getResponse(
        res,
        "Discount price cannot be greater than original price",
        "",
        "error"
      );
    }

    const discountPercentage =
      original > 0
        ? Math.round(((original - discount) / original) * 100)
        : 0;

    // 🔥 Handle Images (Keep old if not replaced)
    const image1 = req.files?.image1?.[0]?.path || existingCracker.image1;
    const image2 = req.files?.image2?.[0]?.path || existingCracker.image2;
    const image3 = req.files?.image3?.[0]?.path || existingCracker.image3;
    const image4 = req.files?.image4?.[0]?.path || existingCracker.image4;
    const image5 = req.files?.image5?.[0]?.path || existingCracker.image5;

    const updatedCracker = await Cracker.findByIdAndUpdate(
      crackerId,
      {
        category,
        crackerNameEnglish,
        crackerNameTamil,
        originalPrice: original,
        discountPrice: discount,
        discountPercentage,
        stockStatus,
        youtubeLink: youtubeLink ?? "",
        instagramLink: instagramLink ?? "",
        duration,
        soundLevel,
        safety,
        image1,
        image2,
        image3,
        image4,
        image5,
        lastUpdatedBy: seller.name,
        lastUpdatedAt: new Date(),
      },
      { new: true }
    );

    return getResponse(res, "Cracker updated successfully", updatedCracker, "success");

  } catch (error) {
    console.log(error);
    return getResponse(res, error.message, "", "error");
  }
};
