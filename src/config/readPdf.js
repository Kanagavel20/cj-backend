const fs = require("fs");
const pdf = require("pdf-parse");


const readPdf = async (filePath) => {
    try {
        const buffer = fs.readFileSync(filePath);
        const data = await pdf(buffer);

        const text = data.text;

        const orderNo =
            text.match(/Order No\s*:\s*([A-Z0-9-]+)/i)?.[1] || "";

        const customerName =
            text.match(/Customer\s*:\s*(.+)/i)?.[1]?.trim() || "";

        const customerMobile =
            text.match(/Customer\s*:.*?\nMobile\s*:\s*(\d+)/is)?.[1] || "";

        const address =
            text.match(/Address\s*:\s*(.+)/i)?.[1]?.trim() || "";

        const totalAmount =
            Number(text.match(/Total Amount\s+(\d+)/i)?.[1]) || 0;

        const products = [];

        const lines = text
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);

        let startReading = false;

        for (const line of lines) {
            if (line.includes("Cracker Name")) {
                startReading = true;
                continue;
            }

            if (!startReading) continue;

            if (
                line.startsWith("Total Amount") ||
                line.startsWith("Thank you")
            ) {
                break;
            }

            console.log("PRODUCT LINE:", line);

            const parts = line.trim().split(/\s+/);

            if (parts.length >= 6) {
                const amount = Number(parts.pop());
                const qty = Number(parts.pop());
                const finalPrice = Number(parts.pop());
                const originalPrice = Number(parts.pop());
                const sno = Number(parts.shift());

                const productName = parts.join(" ");

                products.push({
                    sno,
                    productName,
                    originalPrice,
                    finalPrice,
                    qty,
                    amount
                });
            }
        }

        return {
            orderNo,
            customerName,
            customerMobile,
            address,
            totalAmount,
            products
        };
    } catch (error) {
        throw error;
    }
};

module.exports = { readPdf };