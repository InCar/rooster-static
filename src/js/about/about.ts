﻿import * as Vue from "vue";
import * as $ from "jquery";
import { App } from "../app";

export = class AboutPage {
    private _base: string;

    constructor() {
        this._base = App.getCfg()['api'];
    }

    public init(resolve, reject) {
        var vthis = this;

        requirejs(['text!about/about.html', `text!about/about-${App.lang()}.json`], (template, txt) => {
            const lang = JSON.parse(txt);

            resolve({
                name: "AboutPage",
                template,
                methods: {
                    i18n: function (value) {
                        return lang[value];
                    }
                },
                data: function () {
                    return {
                        txtFromRemote: "loading..."
                    }
                },
                mounted: function () {
                    var fnGetValue : any = {
                        method: "GET",
                        url: `${vthis._base}/api/SandBox/hello-world/get-value/9853/org/405`,
                        headers: {
                            "x-hub-from_app": 9853
                        }
                    };

                    $.ajax(fnGetValue).then(
                        (data) => { this.txtFromRemote = data },
                        (ex) => { this.txtFromRemote = ex.statusText; });
                }
            });
        });
    }
};