const nodemailer = require("nodemailer");

const sendAssignmentEmail = async (salesmanEmail, salesmanName, targetListName, description, adminName) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: process.env.SMTP_PORT || 2525,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"TD Web Services" <${process.env.SMTP_FROM_EMAIL || "hr@in.tdwebservices.com"}>`,
      to: salesmanEmail,
      subject: `New Target List Assigned: ${targetListName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">New Target List Assignment</h2>
          <p>Hello <strong>${salesmanName}</strong>,</p>
          <p>You have been assigned a new target list by <strong>${adminName}</strong>.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Target List Name:</strong> ${targetListName}</p>
            <p><strong>Description:</strong></p>
            <p style="white-space: pre-wrap; color: #555;">${description || "No description provided."}</p>
          </div>
          
          <p style="margin-top: 30px;">Please login to the Prospect Data Engine to view the list and start outreach.</p>
          <br/>
          <p style="font-size: 0.9em; color: #777;">Regards,<br/>TD Web Services Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Assignment email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending assignment email:", error);
    return false;
  }
};

module.exports = {
  sendAssignmentEmail,
};
