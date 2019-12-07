'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;
    let jwt = app.middleware.jwt({ app })
    router.get('/', controller.home.index);
    router.get('/userinfo', controller.user.index);
    router.get('/demoinfo', controller.user.demoinfo);

    router.get('/user/sendcode', controller.user.email);
    router.get('/user/captcha', controller.user.captcha);
    router.post('/user/register', controller.user.create);
    router.post('/user/login', controller.user.login);

    router.post('/user/detail', jwt, controller.user.detail);

    const {following,followers,likeArticle,cancelLikeArticle,articleStatus} = controller.user
    router.get('/user/:id/following', jwt, following);
    router.get('/user/:id/followers', jwt, followers);

    router.put('/user/likeArticle/:id', jwt, likeArticle);
    router.delete('/user/likeArticle/:id', jwt, cancelLikeArticle);

    router.get('/user/article/:id', jwt, articleStatus);



    const {isfollow,follow,cancelFollow} = controller.user
    router.get('/user/follow/:id', jwt, isfollow);
    router.put('/user/follow/:id', jwt, follow);
    router.delete('/user/follow/:id', jwt, cancelFollow);

    router.get('/article', controller.article.index);
    router.get('/article/:id', controller.article.detail);
    router.post('/article/create', jwt, controller.article.create);

};