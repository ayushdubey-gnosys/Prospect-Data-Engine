const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");


const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const register = async (req, res) => {
  try {
    const { name, email, phone, mobile, password, role } = req.body;
    const phoneNumber = phone || mobile;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
        error: "Email already exists",
      });
    }

    if (phoneNumber) {
      const existingPhone = await User.findOne({ phone: phoneNumber });

      if (existingPhone) {
        return res.status(400).json({
          message: "Phone number already exists",
          error: "Phone number already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone: phoneNumber,
      password: hashedPassword,
      role: role || "sales",
    });

    // Hide password
    const userData = user.toObject();

    delete userData.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;

    await user.save();

    // Hide password
    const userData = user.toObject();

    delete userData.password;

    // Cookies
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction, // must be true in production for cross-site cookies
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear cookies with same attributes used when setting them
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const meController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};





module.exports = {
  register,
  login,
  logout,
  meController
};