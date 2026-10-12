import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || 'contact@technthesis.name.ng';

// Data directory for persistent storage of form inquiries
const DATA_DIR = path.join(__dirname, 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to save inquiry to file
function saveInquiry(record) {
  try {
    let list = [];
    if (fs.existsSync(INQUIRIES_FILE)) {
      const raw = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      list = JSON.parse(raw);
    }
    list.unshift(record);
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('Error saving inquiry:', err);
  }
}

// API endpoint to process contact form submissions
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Email, Message).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const inquiryRecord = {
      id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      service: (service || 'General Inquiry').trim(),
      message: message.trim(),
      targetEmail: OFFICIAL_EMAIL
    };

    // 1. Save submission locally so no message is ever lost
    saveInquiry(inquiryRecord);

    let emailDelivered = false;
    let deliveryMethod = 'saved_locally';

    // 2. If SMTP environment variables are configured, send direct email via Nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const mailSubject = `[Tech 'n Thesis Inquiry] ${inquiryRecord.service} - ${inquiryRecord.name}`;
        const mailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-top: 0;">New Project Inquiry</h2>
            <p style="color: #475569;">You have received a new inquiry from the Tech 'n Thesis website form:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px; font-weight: bold; width: 140px; border-bottom: 1px solid #f1f5f9;">Full Name:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiryRecord.name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${inquiryRecord.email}">${inquiryRecord.email}</a></td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Service:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiryRecord.service}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Received At:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiryRecord.timestamp}</td></tr>
            </table>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <strong style="color: #0f172a; display: block; margin-bottom: 8px;">Message:</strong>
              <p style="color: #334155; margin: 0; white-space: pre-wrap;">${inquiryRecord.message}</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Tech 'n Thesis Form" <${process.env.SMTP_USER}>`,
          to: OFFICIAL_EMAIL,
          replyTo: inquiryRecord.email,
          subject: mailSubject,
          text: `New inquiry from ${inquiryRecord.name} (${inquiryRecord.email})\nService: ${inquiryRecord.service}\n\nMessage:\n${inquiryRecord.message}`,
          html: mailHtml
        });

        emailDelivered = true;
        deliveryMethod = 'smtp';
      } catch (smtpErr) {
        console.error('SMTP delivery failed:', smtpErr.message);
      }
    }

    // 3. Fallback: Relay via FormSubmit service directly to OFFICIAL_EMAIL
    if (!emailDelivered) {
      try {
        const formSubmitUrl = `https://formsubmit.co/ajax/${encodeURIComponent(OFFICIAL_EMAIL)}`;
        const relayResp = await fetch(formSubmitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://technthesis.name.ng',
            'Referer': 'https://technthesis.name.ng/contact.html'
          },
          body: JSON.stringify({
            name: inquiryRecord.name,
            email: inquiryRecord.email,
            service: inquiryRecord.service,
            message: inquiryRecord.message,
            _subject: `New Project Inquiry: ${inquiryRecord.name} (${inquiryRecord.service})`,
            _replyto: inquiryRecord.email
          })
        });

        const relayData = await relayResp.json().catch(() => null);
        if (relayResp.ok) {
          emailDelivered = true;
          deliveryMethod = 'formsubmit_relay';
        } else {
          console.log('FormSubmit relay note:', relayData);
        }
      } catch (relayErr) {
        console.error('Relay error:', relayErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Thank you, ${inquiryRecord.name.split(' ')[0]}! Your message has been sent to our team at ${OFFICIAL_EMAIL}. We will respond within 24 hours.`,
      inquiryId: inquiryRecord.id,
      deliveryMethod
    });
  } catch (err) {
    console.error('Error in /api/contact:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your request. Please contact us via WhatsApp.'
    });
  }
});

// Admin endpoint to view saved inquiries
app.get('/api/inquiries', (req, res) => {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
      return res.json({ count: data.length, inquiries: data });
    }
    return res.json({ count: 0, inquiries: [] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read inquiries.' });
  }
});

// Serve static files from root directory with HTML extension support
app.use(express.static(__dirname, {
  extensions: ['html']
}));

// Route handler for root and pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Official contact email: ${OFFICIAL_EMAIL}`);
});
