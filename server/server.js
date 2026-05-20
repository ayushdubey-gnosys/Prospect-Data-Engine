const app = require("./src/app");
const connectDB = require("./src/config/db");

require('dotenv').config();
app.listen(3000, () => {
connectDB();
  console.log("Server is running on port 3000");
}
);