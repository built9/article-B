const Service = require('egg').Service
const nodemailer = require('nodemailer')
const svgCaptcha = require('svg-captcha')

const userEmail = '771524005@qq.com'

let transporter = nodemailer.createTransport({
	service:'qq',
	port:465,
	secureConnetion:true,
	auth:{
		user:userEmail,
		pass:'usifxbrshdjbbfbj'
	}
})
class ToolsService extends Service{
	captcha(){
		let captcha = svgCaptcha.create({
			size:4,
			fontSize:50,
			width:100,
			height:40
		})
		return captcha
	}
	async sendEmail(email,title,html){
		const mailOptions={
			from:userEmail,
			to:email,
			subject:title,
			text:'',
			html
		}
		try{
			await transporter.sendMail(mailOptions)
			return true
		}catch(err){
			console.log(err)
			return false
		}
	}
}

module.exports = ToolsService