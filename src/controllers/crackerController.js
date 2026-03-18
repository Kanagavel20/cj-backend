const Cracker = require("../models/cracker");
const Seller = require("../models/sellers");
const { getResponse } = require("../constants/constants");
const cloudinary = require("cloudinary").v2;
const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const path = require("path");
const Order = require("../models/orders")
const OrderCounter = require('../models/orderCounter')



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
        crackerType: cracker.crackerType,
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
      discountPercentage,
      stockStatus,
      youtubeLink,
      instagramLink,
      crackerType,
      duration,
      soundLevel,
      safety
    } = req.body;

    const original = Number(originalPrice);
    const discount = Number(discountPrice);


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
        crackerType,
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



exports.getCrackers = async (req, res) => {
  try {

    const lang = req.query.lang === "tamil" ? "tamil" : "english";

    const crackers = await Cracker.find()
      .populate({
        path: "category",
        model: "Category",
        select: "categoryNameEnglish categoryNameTamil"
      })
      .lean();

    const groupedData = {};

    crackers.forEach((cracker) => {

      if (!cracker.category) return;

      const categoryId = cracker.category._id.toString();

      const categoryName =
        lang === "tamil"
          ? cracker.category.categoryNameTamil || cracker.category.categoryNameEnglish
          : cracker.category.categoryNameEnglish;

      const crackerName =
        lang === "tamil"
          ? cracker.crackerNameTamil || cracker.crackerNameEnglish
          : cracker.crackerNameEnglish;

      const crackerId = cracker._id?.toString();

      if (!groupedData[categoryId]) {
        groupedData[categoryId] = {
          name: categoryName,
          subCategories: []
        };
      }

      groupedData[categoryId].subCategories.push({
        crackerId,
        crackerName,
        image1: cracker.image1,
        image2: cracker.image2,
        image3: cracker.image3,
        image4: cracker.image4,
        image5: cracker.image5,
        originalPrice: cracker.originalPrice,
        finalPrice: cracker.discountPrice,
        discountPercentage: cracker.discountPercentage,
        stockStatus: cracker.stockStatus,
        disabled: cracker.stockStatus === "Out of Stock",
        youtubeLink: cracker.youtubeLink,
        duration: cracker.duration,
        safety: cracker.safety,
        soundLevel: cracker.soundLevel,
        crackerType: cracker.crackerType,
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

function loadTamilFont(doc) {
  const fontPath = path.join(__dirname, "../assets/NotoSansTamil-Regular.ttf");

  const font = fs.readFileSync(fontPath);
  const fontBase64 = font.toString("base64");

  doc.addFileToVFS("NotoSansTamil-Regular.ttf", fontBase64);
  doc.addFont("NotoSansTamil-Regular.ttf", "NotoTamil", "normal");
}

const getNextOrderNumber = async () => {
  const today = new Date();

  const dateStr =
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const counter = await OrderCounter.findOneAndUpdate(
    { date: dateStr },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq.toString().padStart(3, "0");

  return `ORD-CJ-${dateStr}-${seq}`;
};
exports.generateOrderPDF = async (req, res) => {
  try {
    const { name, phone, address, city, pincode, cart } = req.body;
    // return console.log("cart",cart)
    const doc = new jsPDF();

    /* ---------- LOAD TAMIL FONT ---------- */
    loadTamilFont(doc);

    const orderNo = await getNextOrderNumber();

    /* ---------- LOGO ---------- */

    const logoPath = path.join(__dirname, "../assets/logo.jpg");

    if (fs.existsSync(logoPath)) {
      const logo = fs.readFileSync(logoPath, { encoding: "base64" });
      const logoBase64 = `data:image/jpeg;base64,${logo}`;

      doc.addImage(logoBase64, "JPEG", 10, 10, 20, 20);
    }

    /* ---------- HEADER ---------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CRACKER JUNCTION", 105, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("A Syndicate by the Boys", 105, 25, { align: "center" });

    /* ---------- SELLER INFO ---------- */

    doc.setFontSize(10);

    const sellerName = "KISHORE M";
    const sellerMobile = "8489843508";

    const labelX = 164;      // label start
    const valueX = 178;      // value start
    const rightEdge = 200;   // right boundary
    const maxWidth = rightEdge - valueX;

    let y = 18;
    const lineHeight = 5;

    // Seller label
    doc.text("Seller  :", labelX, y);

    // Wrap seller value
    doc.setFont("helvetica", "bold");
    const sellerLines = doc.splitTextToSize(sellerName, maxWidth);

    doc.text(sellerLines, valueX, y);

    // Move Y based on wrapped lines
    y += sellerLines.length * lineHeight;

    // Mobile
    doc.setFont("helvetica", "normal");
    doc.text("Mobile :", labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(sellerMobile, valueX, y);
    doc.setFont("helvetica", "normal");


    const dividerY = Math.max(35, y + 5);

    doc.line(10, dividerY, 200, dividerY);

    /* ---------- CUSTOMER INFO ---------- */

    doc.setFontSize(11);

    const startY = dividerY + 13;

    doc.text("Order No    :", 10, startY);
    doc.setFont("helvetica", "bold");
    doc.text(orderNo, 33, startY);
    doc.setFont("helvetica", "normal");


    doc.text("Customer   :", 10, startY + 7);
    doc.setFont("helvetica", "bold");
    doc.text(name?.toUpperCase() || "-", 33, startY + 7);
    doc.setFont("helvetica", "normal");


    doc.text("Mobile        :", 10, startY + 14);
    doc.setFont("helvetica", "bold");
    doc.text(phone || "-", 33, startY + 14);
    doc.setFont("helvetica", "normal");


    doc.text("Address      :", 10, startY + 21);
    doc.setFont("helvetica", "bold");
    doc.text(`${address?.toUpperCase()}, ${city?.toUpperCase()} - ${pincode}`, 33, startY + 21);
    doc.setFont("helvetica", "normal");


    /* ---------- TABLE DATA ---------- */

    const rows = [];
    let total = 0;
    let serialNo = 1;
    Object.keys(cart).forEach((key) => {
      const item = cart[key];

      const amount = item.qty * item.price;
      total += amount;

      rows.push([
        serialNo++,
        item.product.crackerName, // Tamil works here
        item.product.originalPrice,
        item.price,
        item.qty,
        amount,
      ]);
    });

    /* ---------- TABLE ---------- */

    doc.setFont("NotoTamil", "normal");

    autoTable(doc, {
      startY: startY + 32,
      margin: {
        left: 10,
        right: 10
      },
      head: [["S.No", "Cracker Name", "Original Price", "Final Price", "Qty", "Amount"]],

      body: rows,

      foot: [
        [
          {
            content: "Total Amount",
            colSpan: 5,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: total.toLocaleString('en-In'),
            styles: { halign: "center", fontStyle: "bold" },
          },
        ],
      ],

      // theme: "grid",
  showFoot: "lastPage",
      headStyles: {
        fillColor: [245, 73, 39],
        textColor: 255,
        halign: "center",
      },

      footStyles: {
        fillColor: [255, 248, 240],
        textColor: 0,
      },

      styles: {
        font: "NotoTamil",
        fontSize: 10,
        cellPadding: 3,
      },

      columnStyles: {
        0: { halign: "center", cellWidth: 16 }, // S.No
        1: { cellWidth: 64 },                   // Cracker name
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    });

    /* ---------- FOOTER ---------- */



    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      "Thank you for choosing Cracker Junction.",
      105,
      finalY + 15,
      { align: "center" }
    );

    doc.text(
      "Have a safe and happy celebration!",
      105,
      finalY + 22,
      { align: "center" }
    );


    const termsStartY = finalY + 35;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Terms & Conditions:", 10, termsStartY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const termsText = [
      "1. Goods once sold will not be taken back or exchanged.",
      "2. Please check the products at the time of delivery.",
      "3. Keep away from children and use under adult supervision.",
      "4. Follow all safety instructions mentioned on the products.",
      "5. Seller is not responsible for any misuse of the products.",
      "6. Delivery timelines may vary based on location and availability.",
    ];

    let currentY = termsStartY + 6;

    termsText.forEach((term) => {
      const splitText = doc.splitTextToSize(term, 190); // wrap within page width
      doc.text(splitText, 10, currentY);
      currentY += splitText.length * 5; // adjust spacing dynamically
    });

    /* ---------- RETURN PDF ---------- */
    await Order.create({
      orderNo,
      clientName: name,
      mobileNo: phone,
      address,
      city,
      pinCode: pincode,
      overallPurchaseAmount: total,
      deliveryStatus: false,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${orderNo}.pdf`,
      "Content-Length": pdfBuffer.length,
      "X-Order-No": orderNo,
      "Access-Control-Expose-Headers": "X-Order-No",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "PDF generation failed", err });
  }
};

// exports.generateOrderPDF = async (req, res) => {
//   try {
//     const { name, phone, address, city, pincode, cart } = req.body;

//     const doc = new jsPDF();

//     const orderNo = "ORD-" + Date.now();
//     const logoPath = path.join(__dirname, "../assets/logo.jpg");

//     if (fs.existsSync(logoPath)) {
//       const logo = fs.readFileSync(logoPath, { encoding: "base64" });
//       const logoBase64 = `data:image/jpeg;base64,${logo}`;

//       // LEFT : Logo
//       doc.addImage(logoBase64, "JPEG", 10, 10, 20, 20);
//     }

//     /* ================= HEADER ================= */

//     // CENTER : Title
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(18);
//     doc.text("CRACKER JUNCTION", 105, 18, { align: "center" });

//     // CENTER : Tagline
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.text("A Syndicate by the Boys", 105, 25, { align: "center" });

//     // RIGHT : Seller info
//     doc.setFontSize(10);

//     const sellerName = "Kanagavel skdajksd asdjkasdjk";
//     const sellerMobile = "8489843508";

//     const labelX = 150;
//     const valueX = 200;
//     const maxWidth = 45;
//     let y = 18;
//     const lineHeight = 5;

//     // Seller label
//     doc.text("Seller :", labelX, y);

//     // Wrap seller name
//     const sellerLines = doc.splitTextToSize(sellerName, maxWidth);

//     doc.text(sellerLines, valueX, y, {
//       align: "right"
//     });

//     // Move Y based on wrapped lines
//     y += sellerLines.length * lineHeight;

//     // Mobile
//     doc.text("Mobile :", labelX, y);
//     doc.text(sellerMobile, valueX, y, { align: "right" });
//     // calculate divider dynamically
//     const dividerY = Math.max(35, sellerY + (mobileLines.length * lineHeight) + 3);

//     // Divider line
//     doc.line(10, dividerY, 200, dividerY);

//     doc.setFontSize(11);

//     doc.text(`Order No :`, 10, 48);
//     doc.text(orderNo, 40, 48);

//     doc.text(`Customer :`, 10, 55);
//     doc.text(name || "-", 40, 55);

//     doc.text(`Mobile :`, 10, 62);
//     doc.text(phone || "-", 40, 62);

//     doc.text(`Address :`, 10, 69);
//     doc.text(`${address}, ${city} - ${pincode}`, 40, 69);

//     const rows = [];
//     let total = 0;

//     Object.keys(cart).forEach((key) => {
//       const item = cart[key];

//       const amount = item.qty * item.price;
//       total += amount;

//       rows.push([
//         item.product.crackerName,
//         item.product.originalPrice,
//         item.price,
//         item.qty,
//         amount,
//       ]);
//     });

//     autoTable(doc, {
//       startY: 80,

//       head: [["Cracker Name", "Original Price", "Final Price", "Qty", "Amount"]],

//       body: rows,

//       foot: [
//         [
//           { content: "Total Amount", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
//           { content: total.toString(), styles: { halign: "right", fontStyle: "bold" } }
//         ]
//       ],

//       theme: "grid",

//       headStyles: {
//         fillColor: [245, 73, 39],
//         textColor: 255,
//         fontStyle: "bold",
//         halign: "center",
//       },

//       footStyles: {
//         fillColor: [255, 248, 240],
//         textColor: 0,
//         fontStyle: "bold",
//       },

//       styles: {
//         fontSize: 10,
//         cellPadding: 3,
//       },

//       columnStyles: {
//         1: { halign: "right" },
//         2: { halign: "right" },
//         3: { halign: "center" },
//         4: { halign: "right" },
//       },
//     });

//     const finalY = doc.lastAutoTable.finalY + 10;


//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(13);


//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(11);

//     doc.text(
//       "Thank you for choosing Cracker Junction.",
//       105,
//       finalY + 15,
//       { align: "center" }
//     );

//     doc.text(
//       "Have a safe and happy celebration!",
//       105,
//       finalY + 22,
//       { align: "center" }
//     );
//     /* ================= RETURN PDF ================= */

//     const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "attachment; filename=cracker-order.pdf",
//       "Content-Length": pdfBuffer.length,
//     });

//     res.send(pdfBuffer);
//   } catch (err) {
//     console.log("error", err)
//     res.status(500).json({ message: "PDF generation failed", err });
//   }
// };