import multer from "multer";

// optional: file filter (good practice)
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PNG, JPG files are allowed"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
