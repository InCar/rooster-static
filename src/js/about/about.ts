import * as Vue from "vue";
import { App } from "../app";

export = class Home {
    constructor() {
    }

    public init(resolve, reject) {
        requirejs(['text!about/about.html', `text!about/about-${App.lang()}.json`], (template, txt) => {
            const lang = JSON.parse(txt);

            resolve({
                name: "About",
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