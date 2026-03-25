// @ts-nocheck
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_secret";

// ================= SIGN UP =================
export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: "Thiếu thông tin đăng ký",
      });
    }

    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        message: "Username đã tồn tại",
      });
    }

    // 🔥 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Lỗi signUp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

// ================= SIGN IN =================
export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username?.trim().toLowerCase();

    if (!normalizedUsername || !password) {
      return res.status(400).json({
        message: "Thiếu username hoặc password",
      });
    }

    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({
        message: "Username hoặc password không đúng",
      });
    }

    // 🔥 FIX QUAN TRỌNG NHẤT
    const passwordCorrect = await bcrypt.compare(
      password,              // password người nhập
      user.hashedPassword    // password đã hash trong DB
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Username hoặc password không đúng",
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,   // dev
      sameSite: "lax", // dev
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `Xin chào ${user.displayName}`,
      accessToken,
    });
  } catch (error) {
    console.error("🔥 Lỗi signIn:", error);
    return res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

// ================= SIGN OUT =================
export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi signOut:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

// ================= REFRESH TOKEN =================
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Không có refresh token",
      });
    }

    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res.status(403).json({
        message: "Token không hợp lệ",
      });
    }

    if (session.expiresAt < new Date()) {
      return res.status(403).json({
        message: "Token đã hết hạn",
      });
    }

    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET || "dev_secret",
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi refreshToken:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};