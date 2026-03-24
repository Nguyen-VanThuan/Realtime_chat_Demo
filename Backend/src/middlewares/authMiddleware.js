import jwt from "jsonwebtoken";
import User from "../models/User.js";

//authorization - xác minh user là ai
const protecttedRoute = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer token

        if (!token) {
            return res.status(401).json({ message: "Không tìm thấy accsess token!" });
        }
        //xác nhận token có hợp lệ không
        jwt .verify(token, process.env.ACCSESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(403).json({ message: "Accsess token không hợp lệ!" });
            }   

            // Nếu token hợp lệ, tìm user tương ứng với token và gắn vào req.user để các controller sau có thể sử dụng thông tin user đã xác thực
            const user = await User.findById(decodedUser.userId).select("-hashedPassword -email -phone -bio -avatarUrl -avatarID -createdAt -updatedAt");
            if (!user) {
                return res.status(404).json({ message: "User không tồn tại!" });
            }

            req.user = user; // Gắn thông tin user đã xác thực vào req.user

            next(); // Tiếp tục xử lý yêu cầu
        });


        //Tìm user tương ứng với token và gắn vào req.user để các controller sau có thể sử dụng thông tin user đã xác thực



        //trả về res nếu token không hợp lệ hoặc user không tồn tại, ngược lại gọi next() để tiếp tục xử lý yêu cầu
    } catch (error) {
        console.error("Lỗi khi xác minh jwt trong middleware:", error);
        return res.status(500).json({ message: "Loi he thong" });
    }   
};

export default protecttedRoute;