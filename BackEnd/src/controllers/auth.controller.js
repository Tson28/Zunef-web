const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const emailValidate = require('../validate/email.validate');
const GenerateToken = require('../utils/token');
const { generateJWTToken } = require('../utils/jwt');
const sendMail = require('../services/mail/mail.service');
const verifyEmailTemplate = require('../services/mail/templates/verifyEmail');
const forgotPasswordTemplate = require('../services/mail/templates/forgetPassword');

const Register = async(req,res) => {
    const {name,email,password} = req.body;
    try{
        if(!name){
            return res.status(400).json({message: "Bạn đã nhập thiếu thông tin họ và tên của bạn!"});
        }
        if(!email){
            return res.status(400).json({message: "Vui lòng nhập email!"});
        }
        if(!password){
            return res.status(400).json({message: "Vui lòng nhập mật khẩu của bạn!"});
        }
        if(!emailValidate(email)){
            return res.status(400).json({message: "Vui lòng nhập email hợp lệ!"});
        }
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(400).json({message: "Email này đã được đăng ký!"});
        };
        const hashPassword = await bcrypt.hash(password,10);
        const token = await GenerateToken();
        const verifyLink = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;
        const {subject, text,html} = verifyEmailTemplate(verifyLink);
        try{
            await sendMail(email,subject,text,html);
            await User.create({
                name,
                email,
                password: hashPassword,
                token,
            })
            return res.status(201).json({message: `Tài khoản người dùng ${email} đã được đăng ký. Vui lòng xác minh trong Email để có thể đăng nhập!`});
        }catch(error){
            return res.status(500).json({message: `Lỗi không thể gửi thư xác minh tới email ${email}. Với lỗi ${error}`});
        }

    }catch(error){
        return res.status(500).json({message: `Đang có lỗi: ${error}`});
    }
}


const Verify = async(req,res) => {
    const {token} = req.query;
    try{
        if(!token){
            return res.redirect(`${process.env.VERIFIED_UI}?status=fail`);
        }
        const tokenUser = await User.findOne({token});
        if(!tokenUser){
            return res.redirect(`${process.env.VERIFIED_UI}?status=fail`);
        }
        tokenUser.isVerified = true;
        tokenUser.token = undefined;
        await tokenUser.save();
        return res.redirect(`${process.env.VERIFIED_UI}?status=success`);
    }catch(error){
        return res.redirect(`${process.env.VERIFIED_UI}?status=fail`);
    }
}

const Login = async(req,res) => {
    const {email,password} = req.body;
    try{
        if(!emailValidate(email)){
            return res.status(400).json("Vui lòng nhập email hợp lệ!");
        }
        const existUser = await User.findOne({email});
        if(!existUser){
            return res.status(400).json("Mật khẩu hoặc tài khoản email của bạn không đúng!");
        }
        if(!email){
            return res.status(400).json("Vui lòng nhập email!");
        }
        if(!password){
            return res.status(400).json("Vui lòng nhập mật khẩu!");
        }
        const user = await User.findOne({email});
        const isMatchPassword = await bcrypt.compare(password,user.password);
        if(!isMatchPassword){
            return res.status(400).json({message: "Mật khẩu hoặc tài khoản email của bạn không đúng!"});
        }
        if(!user.isVerified){
            return res.status(400).json({message: "Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản!"});
        }
        
        // Generate JWT token
        const token = generateJWTToken({
            id: user._id,
            email: user.email,
            name: user.name
        });
        
        // Return user data and token
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            role: user.role,
            createdAt: user.createdAt
        };
        
        return res.status(200).json({
            success: true,
            message: "Bạn đã đăng nhập thành công!",
            data: {
                user: userData,
                token: token
            }
        });
    }catch(error){
        return res.status(500).json({message: `Bạn đã đăng nhập thất bại với mã lỗi: ${error}`});
    }
}

const ForgetPassword = async(req,res) => {
    const {email} = req.body;
    try{
        const exitsUser = await User.findOne({email});
        if(!exitsUser){
            return res.status(400).json({message: "Người dùng này chưa được đăng ký!"});
        }
        if(!exitsUser.isVerified){
            return res.status(400).json({message: "Bạn chưa xác minh danh tính!"});
        }
        const resetToken = await GenerateToken();
        exitsUser.token = resetToken;
        await exitsUser.save();
        const resetPasswordLink = `${process.env.RESET_PASSWORD_UI}?token=${resetToken}`;
        const {subject, text , html} = forgotPasswordTemplate(resetPasswordLink);
        try{
            await sendMail(email,subject,text,html);
        return res.status(200).json({message: "Chúng tôi đã gửi một đường dẫn đến trang đặt lại mật khẩu vào email của bạn!"});
        }catch(error){
            return res.status(500).json({message: `Không thể gửi được đường dẫn với mã lỗi ${error}`});
        }
    }catch(error){
        return res.status(500).json({message: `Không thể gửi lại đường dẫn để đặt lại mật khẩu với mã lỗi: ${error}`});
    }
}

const ResetPassword = async(req,res) => {
    const {token} = req.query;
    const {newpassword} = req.body;
    try{
        const user = await User.findOne({token});
        const hashnewPassword = await bcrypt.hash(newpassword,10);
        if(user.token === token){
            user.password = hashnewPassword;
            user.token = undefined;
            user.save();
            return res.status(200).json({message: "Đã đổi mật khẩu thành công!"});
        }
        return res.status(400).json({message: "Liên kết đã hết hiệu lực hoặc có lỗi xảy ra khi đổi mật khẩu!"});
    }catch(error){
        return res.status(500).json({message: `Đã có lỗi xảy ra với mã lỗi: ${error}`});
    }
}

module.exports = {Register, Verify, Login, ForgetPassword, ResetPassword};