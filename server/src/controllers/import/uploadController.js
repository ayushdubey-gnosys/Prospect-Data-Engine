const path = require("path");
const fs = require("fs");
const multer = require("multer");
const fileService = require("../../services/fileService");
const companyService = require("../../services/companyService");
const UploadedFile = require("../../models/uploadedFile.model");
const Company = require("../../models/company.model");

// Multer storage
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  },
});

const upload = multer({ storage });

// Helper to map various header names to our company schema
const mapRowToCompany = (row) => {
  const get = (keys) => {
    for (const k of keys) {
      if (row[k] != null) return row[k];
      // case-insensitive
      const found = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
      if (found) return row[found];
    }
    return null;
  };

  // Parse serialized contacts if any
  const serializedContacts = get(["employee_contacts", "Employee Contacts", "contacts", "Contacts"]);
  let parsedContacts = [];
  if (serializedContacts && typeof serializedContacts === "string") {
    const trimmedContacts = serializedContacts.trim();
    if (trimmedContacts.startsWith("[") && trimmedContacts.endsWith("]")) {
      try {
        parsedContacts = JSON.parse(trimmedContacts);
      } catch (e) {
        // Fallback to normal semicolon-separated parsing if JSON parsing fails
      }
    }

    if (parsedContacts.length === 0) {
      // Example: "John Doe (Manager - 1234567890, john@example.com); Jane Smith (Developer - 9876543210, jane@example.com)"
      const parts = serializedContacts.split(";");
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        // Regexp to match Name (Position - Phone, Email) or Name (Position - Phone)
        const match = trimmed.match(/^([^(]+)\(([^)]+)\)$/);
        if (match) {
          const name = match[1].trim();
          const detailsStr = match[2];
          const dashIndex = detailsStr.indexOf("-");
          let position = null;
          let rest = "";
          if (dashIndex !== -1) {
            position = detailsStr.substring(0, dashIndex).trim();
            rest = detailsStr.substring(dashIndex + 1).trim();
          } else {
            position = detailsStr.trim();
          }
          
          let contactNumber = null;
          let email = null;
          if (rest) {
            const subparts = rest.split(",");
            contactNumber = subparts[0] ? subparts[0].trim() : null;
            email = subparts[1] ? subparts[1].trim() : null;
          }
          parsedContacts.push({ name, position, contactNumber, email });
        } else {
          parsedContacts.push({ name: trimmed, position: null, contactNumber: null, email: null });
        }
      }
    }
  }

  // If no serialized contacts, check individual columns
  if (parsedContacts.length === 0) {
    const contactName = get(["employee_name", "Employee Name", "contact_name", "Contact Name", "employee", "Employee"]);
    const contactPosition = get(["employee_position", "Employee Position", "contact_position", "Contact Position", "position", "Position", "designation", "Designation"]);
    const contactPhone = get([
      "contact_number",
      "Contact Number",
      "employee_phone",
      "Employee Phone",
      "employee_contact",
      "Employee Contact",
      "contact_no",
      "Contact No",
      "employee_phone_number",
      "contatc no",
      "contatc_no",
      "contact no.",
      "contatc no.",
      "contatc number",
      "contatc_number"
    ]);
    const contactEmail = get(["employee_email", "Employee Email", "contact_email", "Contact Email"]);

    if (contactName || contactPosition || contactPhone || contactEmail) {
      parsedContacts.push({
        name: contactName || null,
        position: contactPosition || null,
        contactNumber: contactPhone || null,
        email: contactEmail || null,
      });
    }
  }

  return {
    company_name: get(["company_name", "name", "Company Name", "company"])
      || get(["companyname", "organisation", "organization"])
      || null,
    industry: get(["industry", "Industry", "sector"]) || null,
    city: get(["city", "City", "town"]) || null,
    email: get(["email", "Email", "e-mail"]) || null,
    phone: get([
      "phone",
      "Phone",
      "telephone",
      "mobile",
      "contact no",
      "contact_no",
      "contatc no",
      "contatc_no",
      "contact no.",
      "contatc no.",
      "contact number",
      "contatc number",
      "contact",
      "contatc"
    ]) || null,
    website: get(["website", "Website", "url"]) || null,
    turnover: get(["turnover", "Turnover", "revenue"]) || null,
    source: get(["source"]) || null,
    country: get(["country", "Country"]) || null,
    socialMedia: get(["socialMedia", "social_media", "social", "linkedin", "LinkedIn"]) || null,
    companyOwnerName: get(["companyOwnerName", "company_owner_name", "owner", "owner_name", "ownerName", "founder"]) || null,
    contacts: parsedContacts,
  };
};

// POST /api/import/upload
const uploadHandler = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      // Check if file with same name has already been uploaded
      const existingFile = await UploadedFile.findOne({ originalName: req.file.originalname }).populate("uploadedBy");
      if (existingFile) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        const uploaderName = existingFile.uploadedBy ? existingFile.uploadedBy.name : "Admin/System";
        const uploaderEmail = existingFile.uploadedBy ? existingFile.uploadedBy.email : "";
        const uploaderStr = uploaderEmail ? `${uploaderName} (${uploaderEmail})` : uploaderName;
        const uploadTime = new Date(existingFile.uploadedAt).toLocaleString();

        return res.status(400).json({
          message: `File upload blocked: A file named "${req.file.originalname}" was already uploaded by salesman "${uploaderStr}" on ${uploadTime}. Please rename your file or upload a different one.`,
          error: `File upload blocked: A file named "${req.file.originalname}" was already uploaded by salesman "${uploaderStr}" on ${uploadTime}. Please rename your file or upload a different one.`
        });
      }

      const filePath = req.file.path;
      const mimetype = req.file.mimetype;

      // parse file
      const rows = await fileService.parseFile(filePath, mimetype);

      // map rows to company objects
      const companies = rows.map((r) => mapRowToCompany(r)).filter((c) => c.company_name);

      // Check for company data duplication in DB
      for (const comp of companies) {
        let exists = null;
        if (comp.company_name && comp.city) {
          const escName = String(comp.company_name).trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const escCity = String(comp.city).trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          exists = await Company.findOne({
            company_name: { $regex: new RegExp("^" + escName + "$", "i") },
            city: { $regex: new RegExp("^" + escCity + "$", "i") }
          });
        }

        if (exists) {
          // Find who uploaded this existing company record
          const fileInfo = await UploadedFile.findById(exists.fileId).populate("uploadedBy");
          if (fileInfo) {
            const uploaderName = fileInfo.uploadedBy ? fileInfo.uploadedBy.name : "Admin/System";
            const uploaderEmail = fileInfo.uploadedBy ? fileInfo.uploadedBy.email : "";
            const uploaderStr = uploaderEmail ? `${uploaderName} (${uploaderEmail})` : uploaderName;
            const uploadTime = new Date(fileInfo.uploadedAt).toLocaleString();

            if (req.file.path && fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
              message: `Data Duplication Error: The company "${comp.company_name}" (City: "${comp.city}") already exists in the database. It was uploaded by salesman "${uploaderStr}" in the file "${fileInfo.originalName}" on ${uploadTime}.`,
              error: `Data Duplication Error: The company "${comp.company_name}" (City: "${comp.city}") already exists in the database. It was uploaded by salesman "${uploaderStr}" in the file "${fileInfo.originalName}" on ${uploadTime}.`
            });
          }
        }
      }

      // create UploadedFile metadata
      const uploadedDoc = await fileService.saveUploadedFile({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        sourceType: path.extname(req.file.originalname).replace(".", ""),
        totalRecords: rows.length,
        uploadedBy: req.user ? req.user._id : null,
        uploadPath: filePath,
      });

      // bulk insert
      const result = await companyService.bulkInsertCompanies(companies, uploadedDoc._id);

      res.status(201).json({
        message: "File processed successfully",
        file: uploadedDoc,
        totalRows: rows.length,
        inserted: result.inserted || 0,
      });
    } catch (error) {
      next(error);
    }
  },
];

module.exports = {
  uploadHandler,
};
