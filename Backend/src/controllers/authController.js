import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";


const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

export const signup = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname } = req.body;

        if (!username || !password || !email || !firstname || !lastname) {
            return res.status(400).json({ message: "Không thể thiếu bất kỳ trường nào!" });
        };


        //kiểm tra xem username hoặc email đã tồn tại chưa

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ message: "Username hoặc email đã tồn tại!" });
        };

        //Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Tạo người dùng mới và lưu vào cơ sở dữ liệu
        const newUser = new User({
            username,
            hashedPassword,
            email,
            displayName: `${firstname} ${lastname}`
        });

        //Trả về phản hồi thành công
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!" });


    } catch (error) {
        console.error("Lỗi gọi SignUp", error);
        res.status(500).json({ message: "Lỗi hệ thống!" });
    }
};

export const signin = async (req, res) => {
    try {

        // Lấy thông tin đăng nhập từ yêu cầu
        const { username, password } = req.body;

        // Kiểm tra xem username và password có tồn tại không
        if (!username || !password) {
            return res.status(400).json({ message: "Username và password là bắt buộc!" });
        };

        // lấy handlepassword  trong database ra so sánh với password đã nhập vào
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Username không tồn tại!" });
        };
        //kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        };

        // Nếu khớp thì tạo accessToken với jwt
        const accessToken = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.ACCSESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );


        // Tạo refreshToken 
        const refreshToken = crypto.randomBytes(64).toString("hex");// tạo một chuỗi ngẫu nhiên dài 64 byte và chuyển đổi nó thành một chuỗi hex để làm refreshToken

        // Tạo session mới để lưu refreshToken

        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL) // 7 ngày
        });

        // trả refrestoken về client để lưu vào cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // chỉ cho phép truy cập cookie từ phía server
            secure: true,// chỉ gửi cookie qua kết nối HTTPS (bảo mật hơn)
            sameSite: "none", // cho phép gửi cookie trong các yêu cầu cross-site (cần thiết khi frontend và backend ở domain khác nhau)
            maxAge: REFRESH_TOKEN_TTL // thời gian sống của cookie (7 ngày)
        });

        //trả accesstoken về trong res
        return res.status(200).json({message: `User ${user.username} logged in successfully`, accessToken });





    } catch (error) {
        console.error("Lỗi gọi SignIn", error);
        res.status(500).json({ message: "Lỗi hệ thống!" });
    }  
};


export const signout = async (req, res) => {
    try {

        // Lấy refreshToken từ cookie
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            // Xóa session khỏi database
            await Session.findOneAndDelete({ refreshToken: refreshToken });

            // Xóa cookie refreshToken trên trình duyệt
            res.clearCookie(refreshToken)
        };

        return res.status(200);// Trả về phản hồi thành công

    } catch (error) {
        console.error("Lỗi gọi SignOut", error);
        res.status(500).json({ message: "Lỗi hệ thống!" });
    }
};