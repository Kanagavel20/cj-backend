exports.getResponse = (res,message, data, response) => {
    if (response === "success") {
        return res.status(201).json({
            success: true,
            message: message,
            data: data
        });
    } else if (response === "error") {
        return res.status(200).json({
            success: false,
            message: message,
            data: data
        })
    } else {
        return res.status(500).json({
            success: false,
            message: message,
        })
    }
}