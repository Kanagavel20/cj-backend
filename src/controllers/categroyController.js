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
      .select("_id categoryNameEnglish categoryNameTamil createdBy lastUpdatedBy createdAt updatedAt")
      .sort({ createdAt: -1 });

    const formattedCategories = categories.map((cat) => {

      const createdDateObj = new Date(cat.createdAt);
      const updatedDateObj = new Date(cat.updatedAt);

      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formatTime = (date) => {
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
      };

      return {
        _id: cat._id,
        categoryNameEnglish: cat.categoryNameEnglish,
        categoryNameTamil: cat.categoryNameTamil,
        createdBy: cat.createdBy,
        lastUpdatedBy: cat.lastUpdatedBy,

        createdDate: formatDate(createdDateObj),
        createdTime: formatTime(createdDateObj),

        updatedDate: formatDate(updatedDateObj),
        updatedTime: formatTime(updatedDateObj)
      };
    });

    return getResponse(
      res,
      "Categories fetched successfully",
      formattedCategories,
      "success"
    );

  } catch (error) {
    console.log(error);
    return getResponse(res, "Internal server error", "", "error");
  }
};