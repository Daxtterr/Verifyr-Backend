const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendForgotPasswordMail = (mailPayload) => {
  const testEmail = `<html>
  <body>
    <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
      <div class="Unsubscribe--addressLine">
        <p class="Unsubscribe--senderName"
          style="font-size:15px;line-height:20px;color:blue"
        >
          PASSWORD RESET CODE
        </p>
        <hr>
        <p style="font-size:12px;line-height:20px">
          <span class="Unsubscribe--senderAddress">Please use this code to reset the password for your Verifyr account.</span>
        </p>
        <p>Here is your code : ${mailPayload.pin}</p>
      </div>
      <p> Thanks <br> The VERIFYR account team</p>
    </div>
  </body>
</html>`;

  const msg = {
    to: mailPayload.to,
    from: {
      name: "EMMANUEL",
      email: "aimuelemmanuel@gmail.com",
    },
    subject: mailPayload.subject,
    html: testEmail,
  };

  sgMail
    .send(msg)
    .then((response) => {
      //console.log(response[0].statusCode);
      //console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { sendForgotPasswordMail };