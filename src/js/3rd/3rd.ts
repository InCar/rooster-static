import * as Vue from "vue";
import { App } from "../app";

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
                        if (this.stack[0] == "alipay") {
                            // TODO: 支付宝登录
                            console.info(App.getQuery("auth_code", window.location.href));
                            console.info(App.getCfg());
                        }
                    }
                }
            });
        });
    }
};