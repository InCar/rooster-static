import * as Vue from "vue";
import { App } from "../app";

export = class Home {
    constructor() {
    }

    public init(resolve, reject) {
        requirejs(['text!home/home.html', `text!home/home-${App.lang()}.json`], (template, txt) => {
            const lang = JSON.parse(txt);

            resolve({
                name: "Home",
                template,
                methods: {
                    i18n: function (value) {
                        return lang[value];
                    }
                }
            });
        });
    }
};