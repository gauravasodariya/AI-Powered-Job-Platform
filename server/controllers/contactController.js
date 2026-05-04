const Contact = require("../models/Contact");
const { sendEmail } = require("../utils/ses");

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    // Send email to admin (optional, using SES)
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL || "job-platform@gmail.com",
        `New Contact Form: ${subject}`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #7a38eb;">New Contact Message</h2>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>From:</strong> ${name} (${email})</p>
            <p style="margin: 5px 0 0 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="padding: 10px; border-left: 4px solid #7a38eb; background: #FFF; margin-bottom: 20px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from AI JobHub.</p>
        </div>
        `,
      );
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
    }

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort("-createdAt");
    res
      .status(200)
      .json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
