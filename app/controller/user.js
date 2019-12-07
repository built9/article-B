'use strict';
let md5 = require('md5')
const BaseController = require('./base');

class UserController extends BaseController {
    async index() {
        const { ctx } = this;
        ctx.body = '用户信息';
    }
    async detail() {
        const { ctx } = this;
        const user = await this.checkEmail(ctx.state.email)
        this.success(user)
    }
    async checkEmail(email) {
        const user = await this.ctx.model.User.findOne({ email })
        return user
    }
    async login() {
        const { ctx, app } = this
        const { email, password } = ctx.request.body
        let user = await ctx.model.User.findOne({
            email,
            password: md5(password)
        })
        if (user) {
            console.log('登录')
            const { nickname } = user
            const token = app.jwt.sign({
                nickname,
                email,
                id: user._id
            }, app.config.jwt.secret, {
                expiresIn: '1h'
            })
            this.success({ token, email })
        } else {
            this.error('用户名或密码错误')
        }
    }
    async create() {
        const { ctx } = this
        let { email, password, emailcode, captcha, nickname } = ctx.request.body
        console.log(ctx.request.body)
        if (emailcode !== ctx.session.emailcode) {
            return this.error('邮箱验证码出错')
        }
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            return this.error('图片验证码错误')
        }
        if (await this.checkEmail(email)) {
            return this.error('邮箱已经存在')
        }

        let ret = await ctx.model.User.create({
            email,
            nickname,
            password: md5(password)
        })
        if (ret._id) {
            this.success('注册成功')
        }

        // 数据校验

    }
    async captcha() {
        // 生成验证码
        const { ctx } = this
        let captcha = await this.service.tools.captcha()

        ctx.session.captcha = captcha.text
        console.log('验证码' + captcha.text)
        ctx.response.type = 'image/svg+xml'
        ctx.body = captcha.data
    }
    async email() {
        const { ctx } = this
        const email = ctx.query.email
        const code = Math.random().toString().slice(2, 6)
        console.log('邮件是：' + email + '验证码是' + code)
        const title = '验证码'
        const html = `
  		<h1>验证码</h1>
  		<div>
  			<a href="https://www.baidu.com">${code}</a>
  		</div>
  	`

        const hasSend = await this.service.tools.sendEmail(email, title, html)
        console.log(hasSend)
        if (hasSend) {
            ctx.session.emailcode = code
            this.message('发送成功')
        } else {
            this.error('发送失败')
        }
    }
    demoinfo() {
        const { ctx } = this;
        this.success('success')
    }
    async isfollow() {
        let { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        let isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
        this.success({ isFollow })
    }
    async follow() {
        let { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        let isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
        if (!isFollow) {
            me.following.push(ctx.params.id)
            me.save()
            this.message('关注成功')
        }
    }
    async cancelFollow() {
        let { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
            this.message('取消成功')
        }
    }
    async following() {
        let { ctx } = this
        const users = await ctx.model.User.findById(ctx.params.id).populate('following')
        this.success(users.following)
    }
    async followers() {
        let { ctx } = this
        const users = await ctx.model.User.find({ following: ctx.params.id })
        this.success(users)

    }
    async likeArticle() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        if (!me.likeArticle.find(id => id.toString() === ctx.params.id)) {
            me.likeArticle.push(ctx.params.id)
            me.save()
            await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: 1 } })
            return this.message('点赞成功')
        }
    }
    async cancelLikeArticle() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        let index = me.likeArticle.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.likeArticle.splice(index, 1)
            me.save()
            await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: -1 } })
            return this.message('取消点赞成功')
        }
    }
    async articleStatus() {
        console.log(999)

        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        console.log(11111)
        console.log(me)
        let like = !!me.likeArticle.find(id=>id.toString()===ctx.params.id)
        console.log(me.likeArticle.find(id=>id.toString()===ctx.params.id))
        console.log(222)

        let dislike = !!me.dislikeArticle.find(id=>id.toString()===ctx.params.id)
        this.success({
        	like,dislike
        })

    }
}

module.exports = UserController;