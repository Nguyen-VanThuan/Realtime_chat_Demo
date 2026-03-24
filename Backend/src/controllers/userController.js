
export const authMe = async (req, res) => {
    try{
        const User = res.user; //
        return res.status(401).json({User});

    } catch{
        console.error("Lỗi khi gọi AuthMe", error);
        res.status(500).json({ message: "Lỗi hệ thống!" });
    }
};