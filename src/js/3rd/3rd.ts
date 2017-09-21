import * as Vue from "vue";
import { App } from "../app";
import { User } from "../api/user";

export = class Third {
    constructor() {
    }

    public init(resolve, reject) {
        requirejs(['text!3rd/3rd.html'], (template) => {

            resolve({
                name: "Third",
                template,
                props: ["stack"],
                mounted: function () {
                    if (this.stack && this.stack.length > 0) {
                        var vthis = this;

                        var usr = new User();
                        if (this.stack[0] == "qq") {
                            // QQ 登录
                            var stateTxt = new URL(window.location.toString()).searchParams.get("state");
                            if(stateTxt){
                                var state = JSON.parse(stateTxt);
                                if (state && state.url) {
                                    // 请求来自于开发人员的测试机器,重定向到开发人员指定的url
                                    var target = new URL(state.url);
                                    if (window.location.origin != target.origin) {
                                        // do jump
                                        var jump = target.origin + target.pathname + window.location.search;
                                        window.location.href = jump;
                                        return;
                                    }
                                }
                            }

                            // 处理QQ登录
                            var code = (new URL(window.location.toString())).searchParams.get("code");
                            if(code){
                                usr.loginFromQQ(code).then((user) => {
                                    // 触发一个登录事件
                                    history.replaceState(null, "QQ登录", "/3rd/qq")
                                    vthis.$emit("login", user);
                                });
                            }
                        }
                        else if (this.stack[0] == "alipay") {
                            // 支付宝登录
                            usr.loginFromAliPay(window.location.search);
                        }
                    }
                }
            });
        });
    }

    private is
};