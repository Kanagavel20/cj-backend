const { google } = require("googleapis");
const stream = require("stream");
const path = require("path");
const oauthCredentials  = require("../client_secret_295441877503-197kcmdi1747bg2d2o92tven19q3ghiq.apps.googleusercontent.com.json");


const oauth2Client = new google.auth.OAuth2(
  oauthCredentials.installed.client_id,
  oauthCredentials.installed.client_secret,
  oauthCredentials.installed.redirect_uris[0]
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
});

oauth2Client.setCredentials({
  refresh_token: "1//0gdRENIQJP9c3CgYIARAAGBASNwF-L9Ircnc-F9W-fOU_bvLzOVYjnqVkBwZJUnhADykjn3lk-ryUz0IFKVNzKKNi7Ou-IBYaLt8",
});


const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

async function uploadPDF(pdfBuffer, fileName) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: ["14vI3GAVsLbXWQrlOM2GPDC4k162ceVow"],
        },
        media: {
            mimeType: "application/pdf",
            body: bufferStream,
        },
        fields: "id, webViewLink",
    });

    return response.data;
}

module.exports = { uploadPDF };