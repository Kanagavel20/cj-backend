const Category = require("../models/category");
const Seller = require("../models/sellers"); // same like your cracker api
const {getResponse} = require("../constants/constants");

exports.createCategory = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const { categoryNameEnglish, categoryNameTamil } = req.body;

    if (!categoryNameEnglish || !categoryNameTamil) {
      return getResponse(res, "Category names are required", "", "error");
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return getResponse(res, "Seller not found", "", "error");
    }

    const category = new Category({
      categoryNameEnglish,
      categoryNameTamil,
      createdBy: seller.name,
      lastUpdatedBy: seller.name,
      lastUpdatedAt: new Date()
    });

    await category.save();

    return getResponse(res, "Category created successfully", category, "success");

  } catch (error) {
    console.log(error);
    return getResponse(res, "Internal server error", "", "error");
  }
};


exports.getCategories = async (req, res) => {
  try {

    const categories = await Category.find()
      .select("_id categoryNameEnglish categoryNameTamil")
      .sort({ createdAt: -1 });

    return getResponse(
      res,
      "Categories fetched successfully",
      categories,
      "success"
    );

  } catch (error) {
    console.log(error);
    return getResponse(res, "Internal server error", "", "error");
  }
};