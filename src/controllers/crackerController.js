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
    // const sellerId = req.user.id;

    // const seller = await Seller.findById(sellerId);
    // if (!seller) {
    //   return getResponse(res, "Seller not found", "", "error");
    // }

    const {
      crackerNameEnglish,
      crackerNameTamil,
      originalPrice,
      offerPrice,
      stock,
      youtube,
      instagram,
      categoryId,
      categoryNameEnglish,
      categoryNameTamil
    } = req.body;

    const mainImage = req.files?.mainImage?.[0]?.path || "";
    const subImage = req.files?.subImage?.[0]?.path || "";

    const cracker = await Cracker.create({
      crackerNameEnglish,
      crackerNameTamil,
      originalPrice,
      offerPrice,
      stock,
      youtubeLink: youtube,
      instagramLink: instagram,
      categoryId,
      categoryNameEnglish,
      categoryNameTamil,
      mainImage,
      subImage,
      discountPrice:100,
      createdBy: "Kanagavel"
    });

    return getResponse(res, "Cracker created", cracker, "success");

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

        const updateData = {
            ...req.body,
            lastUpdatedBy: seller.name,
            lastUpdatedAt: new Date()
        };

        const cracker = await Cracker.findByIdAndUpdate(
            crackerId,
            updateData,
            { new: true }
        );

        if (!cracker) {
            return getResponse(res, "Cracker not found", "", "error");
        }

        return getResponse(res, "Cracker updated", cracker, "success");

    } catch (error) {
        console.log(error);
        return getResponse(res, "Internal server error", "", "error");
    }
};
