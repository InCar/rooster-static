// 开发人员复制此文件为"app-dev.ts"，在其中设置自己配置项

define([], () => {
    return {
        // 后台API位置
        "api": "http://localhost:8080",
        // 支付宝登录沙箱 帐号qfdixk1030@sandbox.com 密码111111
        "alipay": "https://openauth.alipaydev.com/oauth2/publicAppAuthorize.htm?app_id=2016081600256157&scope=auth_user&redirect_uri=http%3a%2f%2flocalhost:8080/3rd/alipay&state=sandbox"
    };
});