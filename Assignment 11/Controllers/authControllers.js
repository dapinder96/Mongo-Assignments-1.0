import userModel from "../models/userModel.js";
import httpStatus from 'http-status-codes';
import bcrypt from 'bcrypt';
import { generateToken } from "../utils.js";

const signup = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Incomplete details", success: false });
    }   
    try {
        const user = await userModel.findOne({ username });
        if (user) {
            return res.status(httpStatus.CONFLICT).json({ message: 'userModel with this username already exists', success: false });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const isAdmin = username === "Daksh_Chawla";

        const newUser = new userModel({
            username,
            password: hashedPassword,
            isAdmin
        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "user registered", success: true });
    } catch (err) {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", success: false });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Incomplete details", success: false });
    }

    try {
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password', success: false });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Invalid credentials" });
        }

        const jwtToken = await generateToken(user._id);
        res.status(httpStatus.OK).json({
            success: true,
            message: "Login successful",
            jwtToken,
            username: user.username,
        });
    } catch (err) {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};

export {login,signup};
