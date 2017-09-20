import * as Vue from "vue";
import { App } from "../app";
import { User } from "../api/user";

export = class Home {
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
                            var code = (new URL(window.location.toString())).searchParams.get("code");
                            usr.loginFromQQ(code).then((user) => {
                                // 触发一个登录事件
                                history.replaceState(null, "QQ登录", "/3rd/qq")
                                vthis.$emit("login", user);
                            });
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
};