import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {type:String,required:true}, 
    email: {type:String,required:true,unique:true}, 
    password: {type:String,required:true}, 
    voucherBalance: {type: Number, default: 0 },
    suspended: { type: Boolean, default: false }, 
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema); 
export default userModel; 