const {readPdf} = require("../config/readPdf")

exports.uploadPdf = async (req, res) => {
  try {
    console.log("file",req.file);
    const result = await readPdf(req.file.path);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};