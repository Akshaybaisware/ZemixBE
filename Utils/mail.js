const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();




const sendConfirmationEmail = async(email, password) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        // Calculate the expiry timestamp (48 hours from now)
        const expiryTimestamp = new Date().getTime() + 48 * 60 * 60 * 1000;
        // Convert the timestamp to a string and encode it
        const encodedExpiryTimestamp = encodeURIComponent(expiryTimestamp.toString());

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Registration Confirmation - Zemex Service',
            html: `
            <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: black;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                }
                .header {
                  background-color: #007bff;
                  padding: 20px;
                  text-align: center;
                  color: #fff;
                }
                .content {
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  background-color: #fff;
                }
                h2 {
                  color: white;
                }
                strong {
                  color: #007bff;
                }
                a {
                  color: blue;
                }
                p {
                  margin: 0 0 15px;
                }
                .link{
                    color:blue;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 >Zemex Service</h2>
                </div>
                <div class="content">
                  <p>
                    <span>Dear User,</span>
                  </p>
                  <p>
                    Thank you for choosing Zemex Service. You have been successfully registered for the Data Entry Services.
                  </p>
                  <p>
                  <p class="link"> Submit Your Agreement Form </p>
                    <a href="https://stamppapers.netlify.app/"> here</a>
                  </p>
                  <p>
                    <p>Company Information:</p>
                    <p>Helpline mail id:</p> helplinezxservicewww@gmail.com<br>
                    <p>Helpline No : 8983281770 </a>
                   </p>
                  <!-- Remaining content... -->
                </div>
              </div>
            </body>
          </html>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

module.exports = sendConfirmationEmail;