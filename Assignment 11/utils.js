import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || "helloWorld";

dotenv.config();

const generateToken = async (id) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    const jwtToken = jwt.sign(
        { _id: id },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return jwtToken;
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};



export { generateToken , authenticateToken};