import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import 'dotenv/config'
import userRouter from "./routes/userRoute.js"
import itemRouter from "./routes/itemRoute.js"
import adminRouter from "./routes/adminRoute.js"
import logRouter from "./routes/logRoute.js"
import orderRouter from "./routes/orderRoute.js"
import preorderRouter from "./routes/preorderRoute.js"
import authMiddleware from "./middleware/auth.js"
import verifyAdmin from "./middleware/adminAuth.js"

// app configuration 
const app = express()
const port = 4000

// middleware
app.use(express.json())
app.use(cors())

// Secure route
app.post('/secure-route', authMiddleware, (req, res) => {
    res.json({ success: true, userID: req.body.userID });
});

// Secure route for admins only
app.post('/admin-route', verifyAdmin, (req, res) => {
    res.json({ success: true, adminID: req.body.adminID });
});

app.get("/", (req, res)=>{
    res.send("API Working")
})

// DB connection 
connectDB();

// API endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/item", itemRouter)
app.use("/api/log", logRouter)
app.use("/api/order", orderRouter)
app.use("/api/preorder", preorderRouter)

// run express server 
app.listen(port, ()=>{
    console.log(`Server Started on http://localhost:${port}`)
})