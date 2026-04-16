const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/response");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  college: user.college,
  avatar: user.avatar,
});

const register = async (req, res) => {
  try {
    const { name, email, password, college, role } = req.body;

    if (!name || !email || !password || !college) {
      return sendError(res, 400, "All required fields are missing");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      role: role || "student",
    });

    const token = generateToken(user);

    return sendSuccess(res, 201, "Registration successful", {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Registration failed");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid credentials");
    }

    const token = generateToken(user);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Login failed");
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, "User profile fetched", { user: req.user });
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return sendError(res, 400, "Google credential is required");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google account
      user = await User.create({
        name,
        email,
        password: "google_oauth_" + googleId, // placeholder, not used for login
        college: "Not specified",
        role: "student",
        avatar: picture,
        googleId,
      });
    } else {
      // Update avatar if changed
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    const token = generateToken(user);
    return sendSuccess(res, 200, "Google login successful", {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return sendError(res, 401, "Invalid Google credential");
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleAuth,
};
