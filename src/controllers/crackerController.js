const Cracker = require("../models/cracker");
const Seller = require("../models/sellers");
const { getResponse } = require("../constants/constants");
const cloudinary = require("cloudinary").v2;



// exports.createCracker = async (req, res) => {
//   try {
//     const sellerId = req.user.id;
//     const seller = await Seller.findById(sellerId);

//     if (!seller) {
//       return getResponse(res, "Seller not found", "", "error");
//     }

//     const {
//       category,
//       crackerNameEnglish,
//       crackerNameTamil,
//       originalPrice,
//       discountPrice,
//       stockStatus,
//       youtubeLink,
//       instagramLink,
//       duration,
//       soundLevel,
//       safety
//     } = req.body;

//     // Convert prices to number (important)
//     const original = Number(originalPrice);
//     const discount = Number(discountPrice);

//     if (!req.files ||
//       (!req.files.image1 &&
//         !req.files.image2 &&
//         !req.files.image3 &&
//         !req.files.image4 &&
//         !req.files.image5)) {
//       return getResponse(res, "At least one image is required", "", "error");
//     }
//     if (discount > original) {
//       return getResponse(res, "Discount price cannot be greater than original price", "", "error");
//     }

//     const image1 = req.files?.image1?.[0]?.path || null;
//     const image2 = req.files?.image2?.[0]?.path || null;
//     const image3 = req.files?.image3?.[0]?.path || null;
//     const image4 = req.files?.image4?.[0]?.path || null;
//     const image5 = req.files?.image5?.[0]?.path || null;

//     const discountPercentage =
//       ((original - discount) / original) * 100;

//     const cracker = await Cracker.create({
//       category,
//       crackerNameEnglish,
//       crackerNameTamil,
//       originalPrice: original,
//       discountPrice: discount,
//       discountPercentage: Math.round(discountPercentage),
//       stockStatus,
//       youtubeLink: youtubeLink ?? "",
//       instagramLink: instagramLink ?? "",
//       duration,
//       soundLevel,
//       safety,
//       image1,
//       image2,
//       image3,
//       image4,
//       image5,
//       createdBy: seller.name,
//       lastUpdatedBy: seller.name
//     });

//     return getResponse(res, "Cracker created successfully", cracker, "success");

//   } catch (error) {
//     console.log(error);
//     return getResponse(res, error.message, "", "error");
//   }
// };


exports.createCracker = async (req, res) => {
  try {

    const sellerId = req.user.id;
    const seller = await Seller.findById(sellerId).lean();

    if (!seller) {
      return getResponse(res, "Seller not found", "", "error");
    }

    const { category, crackerNameEnglish, crackerNameTamil, originalPrice,
      discountPrice, discountPercentage, stockStatus, youtubeLink, instagramLink,
      duration, soundLevel, safety, crackerType } = req.body;

    if (!category) {
      return getResponse(res, "Category is required", "", "error");
    }

    if (!crackerNameEnglish || crackerNameEnglish.trim().length < 2) {
      return getResponse(res, "Valid English cracker name is required", "", "error");
    }

    if (!crackerNameTamil || crackerNameTamil.trim().length < 2) {
      return getResponse(res, "Valid Tamil cracker name is required", "", "error");
    }

    if (!originalPrice || isNaN(originalPrice) || Number(originalPrice) <= 0) {
      return getResponse(res, "Original price must be a valid number", "", "error");
    }

    if (!discountPrice || isNaN(discountPrice) || Number(discountPrice) <= 0) {
      return getResponse(res, "Discount price must be a valid number", "", "error");
    }

    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (discount > original) {
      return getResponse(res, "Discount price cannot be greater than original price", "", "error");
    }

    if (!stockStatus) {
      return getResponse(res, "Stock status is required", "", "error");
    }

    if (!crackerType) {
      return getResponse(res, "Cracker type is required (day/night)", "", "error");
    }


    if (!youtubeLink) {
      return getResponse(res, "Invalid YouTube link", "", "error");
    }

    if (!instagramLink) {
      return getResponse(res, "Invalid Instagram link", "", "error");
    }

    if (!duration) {
      return getResponse(res, "Duration is required", "", "error");
    }

    if (!soundLevel) {
      return getResponse(res, "Invalid sound level", "", "error");
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return getResponse(res, "At least one image is required", "", "error");
    }

    const image1 = req.files?.image1?.[0]?.path || null;
    const image2 = req.files?.image2?.[0]?.path || null;
    const image3 = req.files?.image3?.[0]?.path || null;
    const image4 = req.files?.image4?.[0]?.path || null;
    const image5 = req.files?.image5?.[0]?.path || null;


    const cracker = await Cracker.create({
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
      crackerType,
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
        image4: cracker.image4,
        image4: cracker.image5,
        originalPrice: cracker.originalPrice,
        discountPrice: cracker.discountPrice,
        discountPercentage: cracker.discountPercentage,
        stockStatus: cracker.stockStatus,
        disabled: cracker.stockStatus === "Out of Stock",
        youtubeLink: cracker.youtubeLink,
        duration: cracker.duration,
        safety: cracker.safety,
        soundLevel: cracker.soundLevel,
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


// exports.updateCracker = async (req, res) => {
//   try {
//     const sellerId = req.user.id;
//     const { crackerId } = req.params;

//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return getResponse(res, "Seller not found", "", "error");
//     }

//     const existingCracker = await Cracker.findById(crackerId);
//     if (!existingCracker) {
//       return getResponse(res, "Cracker not found", "", "error");
//     }

//     const {
//       category,
//       crackerNameEnglish,
//       crackerNameTamil,
//       originalPrice,
//       discountPrice,
//       stockStatus,
//       youtubeLink,
//       instagramLink,
//       duration,
//       soundLevel,
//       safety,
//     } = req.body;

//     const original = Number(originalPrice);
//     const discount = Number(discountPrice);

//     if (discount > original) {
//       return getResponse(
//         res,
//         "Discount price cannot be greater than original price",
//         "",
//         "error"
//       );
//     }

//     const discountPercentage =
//       original > 0
//         ? Math.round(((original - discount) / original) * 100)
//         : 0;

//     // 🔥 Handle Images (Keep old if not replaced)
//     const image1 = req.files?.image1?.[0]?.path || existingCracker.image1;
//     const image2 = req.files?.image2?.[0]?.path || existingCracker.image2;
//     const image3 = req.files?.image3?.[0]?.path || existingCracker.image3;
//     const image4 = req.files?.image4?.[0]?.path || existingCracker.image4;
//     const image5 = req.files?.image5?.[0]?.path || existingCracker.image5;

//     const updatedCracker = await Cracker.findByIdAndUpdate(
//       crackerId,
//       {
//         category,
//         crackerNameEnglish,
//         crackerNameTamil,
//         originalPrice: original,
//         discountPrice: discount,
//         discountPercentage,
//         stockStatus,
//         youtubeLink: youtubeLink ?? "",
//         instagramLink: instagramLink ?? "",
//         duration,
//         soundLevel,
//         safety,
//         image1,
//         image2,
//         image3,
//         image4,
//         image5,
//         lastUpdatedBy: seller.name,
//         lastUpdatedAt: new Date(),
//       },
//       { new: true }
//     );

//     return getResponse(res, "Cracker updated successfully", updatedCracker, "success");

//   } catch (error) {
//     console.log(error);
//     return getResponse(res, error.message, "", "error");
//   }
// };


exports.updateCracker = async (req, res) => {

  try {

    const sellerId = req.user.id;
    const { crackerId } = req.params;

    const seller = await Seller.findById(sellerId).lean();

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
      safety
    } = req.body;

    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (discount > original) {
      return getResponse(res, "Discount price cannot be greater than original price", "", "error");
    }

    const discountPercentage =
      original > 0
        ? Math.round(((original - discount) / original) * 100)
        : 0;

    let image1 = existingCracker.image1;
    let image2 = existingCracker.image2;
    let image3 = existingCracker.image3;
    let image4 = existingCracker.image4;
    let image5 = existingCracker.image5;

    const deleteOldImage = async (url) => {

      if (!url) return;

      try {

        const publicId = url.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(`crackers/${publicId}`);

      } catch (err) {

        console.log("Cloudinary delete error:", err);

      }

    };

    // IMAGE 1
    if (req.files?.image1) {

      await deleteOldImage(existingCracker.image1);
      image1 = req.files.image1[0].path;

    } else if (req.body.removeImage1 === "true") {

      await deleteOldImage(existingCracker.image1);
      image1 = null;

    }

    // IMAGE 2
    if (req.files?.image2) {

      await deleteOldImage(existingCracker.image2);
      image2 = req.files.image2[0].path;

    } else if (req.body.removeImage2 === "true") {

      await deleteOldImage(existingCracker.image2);
      image2 = null;

    }

    // IMAGE 3
    if (req.files?.image3) {

      await deleteOldImage(existingCracker.image3);
      image3 = req.files.image3[0].path;

    } else if (req.body.removeImage3 === "true") {

      await deleteOldImage(existingCracker.image3);
      image3 = null;

    }

    // IMAGE 4
    if (req.files?.image4) {

      await deleteOldImage(existingCracker.image4);
      image4 = req.files.image4[0].path;

    } else if (req.body.removeImage4 === "true") {

      await deleteOldImage(existingCracker.image4);
      image4 = null;

    }

    // IMAGE 5
    if (req.files?.image5) {

      await deleteOldImage(existingCracker.image5);
      image5 = req.files.image5[0].path;

    } else if (req.body.removeImage5 === "true") {

      await deleteOldImage(existingCracker.image5);
      image5 = null;

    }
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
        lastUpdatedAt: new Date()
      },
      { new: true }
    );

    return getResponse(
      res,
      "Cracker updated successfully",
      updatedCracker,
      "success"
    );

  } catch (error) {

    console.log(error);

    return getResponse(res, error.message, "", "error");

  }

};