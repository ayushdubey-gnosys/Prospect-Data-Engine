const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth/authRoutes");
const companyRoutes = require("./routes/company/companyRoutes");
const importRoutes = require("./routes/import/importRoutes");
const exportRoutes = require("./routes/export/exportRoutes");
const tagRoutes = require("./routes/tag/tagRoutes");
const filesRoutes = require("./routes/files/filesRoutes");
const filtersRoutes = require("./routes/filters/filtersRoutes");
const userRoutes = require("./routes/user/userRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");


const app = express();


app.use(cookieParser());
app.use(express.json());

app.use(helmet());
app.use(compression());
// app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PDE Backend Running",
  });
});


const whitelist = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://prospect-data-engine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/tag", tagRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

module.exports = app;