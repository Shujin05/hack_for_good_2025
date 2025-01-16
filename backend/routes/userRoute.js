import express from "express"
import {changePassword, getUserInfo, listAllUsers, loginUser, registerUser} from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post('/register', registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/changePassword", changePassword);
userRouter.get("/listAllUsers", listAllUsers);
userRouter.get("/getUserInfo", authMiddleware, getUserInfo);

export default userRouter; 