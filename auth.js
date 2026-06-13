const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  "295441877503-197kcmdi1747bg2d2o92tven19q3ghiq.apps.googleusercontent.com",
  "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",
  "http://localhost"
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive.file"]
});

async function getRefreshToken() {
  const { tokens } = await oauth2Client.getToken(
    "4/0AdkVLPw5kptM9e_1zfQ5essjqQ-4i6mSWCxvhM3jmt0irdW96tGK8m4DqEtEj3JjqFPN4A"
  );

  console.log(tokens);
}

getRefreshToken();

console.log(url);