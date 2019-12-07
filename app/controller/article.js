'use strict';
const marked = require('marked')
const BaseController = require('./base');

class ArticleController extends BaseController {
  async index(){
    const {ctx} = this
    let articles = await ctx.model.Article.find().populate('author')
    this.success(articles)
  }
  async detail(){
    const {ctx} = this
    const {id} = ctx.params
    let articles = await ctx.model.Article.findOneAndUpdate({_id:id},{$inc:{'views':1}}).populate('author')
    this.success(articles)
  }
  async create(){
    const {ctx} =this
    const {userid} = ctx.state
    const {content} = ctx.request.body
    const title = content.split('\n').find(v=>{
      return v.indexOf('# ') === 0
    })
    const obj ={
      title:title.replace('# ',''),
      article:content,
      article_html:marked(content),
      author:userid
    }
    let ret = await ctx.model.Article.create(obj)
    if(ret._id){
      this.success({
        id:ret._id,
        title:ret.title
      })
    }else{
      this.error('创建失败')
    }
  }
}

module.exports = ArticleController;
