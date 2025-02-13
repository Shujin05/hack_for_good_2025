import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

// Login function 
const loginUser = async (req, res) => {
    const {email,password} = req.body; 
    try {
        const user = await userModel.findOne({email}); 

        if (!user) {
            return res.json({success:false, message:"User doesn't exist"})
        }

        if (user.suspended) {
            return res.json({ success: false, message: "Your account is suspended. Contact admin for more details." });
        }
        
        const isMatch = await bcrypt.compare(password, user.password); 

        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token = createToken(user._id); 
        res.json({success:true, token})
    } catch (error) {
        console.log(error); 
        res.json({success: false, message: error})
    }
}

// create token 
const createToken = (id) => {
    return jwt.sign({id: id, isAdmin: false}, process.env.JWT_SECRET)
}

// register user
const registerUser = async (req, res) => {
    const {name, email, password, confirmPassword} = req.body; 

    try {
        // check if account already exists
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({success:false, message:"Account already exists"})
        }

        // validate email and password 
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email"})
        }

        if (confirmPassword !== password) {
            return res.json({success:false, message:"Please ensure both passwords are the same"})
        }

        if (password.length < 8 ) {
            return res.json({success:false, message:"Password length should be greater than 8"})
        }

        // hash user password 
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt)

        // save user to database 
        const newUser = new userModel({
            name: name, 
            email: email, 
            password: hashedPassword, 
        })

        const user = await newUser.save()

        // create token 
        const token = createToken(user._id)
        res.json({success:true, token})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
    }
}

// Change password function
const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword} = req.body;

    try {
        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        if (confirmPassword != newPassword) {
            return res.json({success:false, message:"Please ensure both passwords are the same"})
        }

        // Validate new password
        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password length should be greater than 8" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedNewPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating password" });
    }
};

// list all users in database
const listAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching users" });
    }
};

// get user's information (name, email, voucherBalance)
const getUserInfo = async (req, res) => {
    const { userID } = req.body; 

    if (!userID) {
        return res.status(400).json({success: false, message: "Invalid input: userID is required."});
    }

    try {
        const user = await userModel.findById(userID).select("name email voucherBalance");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({success: false, message: "An error occurred while fetching user info."});
    }
};

// add voucher balance of users after completing tasks 
const addVoucher = async (req, res) => {
    const { userID, voucherAmount } = req.body; 

    if (!userID || !voucherAmount) {
        return res.status(400).json({success: false, message: "Invalid input: userID and voucher amount are required."});
    }

    if (typeof voucherAmount !== 'number' || voucherAmount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid input: voucherAmount must be a positive number." });
    }

    try {
        const user = await userModel.findById(userID)

        if (!user) {
            return res.status(404).json({success: false, message: "User not found."});
        }

        user.voucherBalance += voucherAmount;
        await user.save();

        return res.status(200).json({success: true, message: "Voucher balance added successfully."});

    } catch (error) {
        console.error("Error adding voucher balance", error);
        return res.status(500).json({success: false, message: "An error occurred while adding user's voucher balance."});
    }
};

export {loginUser, registerUser, changePassword, listAllUsers, getUserInfo, addVoucher}; 