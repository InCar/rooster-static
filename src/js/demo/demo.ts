import * as Vue from "vue";
import { App } from "../app";

export = class DemoPage {
    constructor() {
    }

    public init(resolve, reject) {
        requirejs(['text!demo/demo.html'], (template) => {
            resolve({
                name: "DemoPage",
                template,
                data: () => {
                    return {
                        clickedTimes: 0
                    }
                },
                props: ['rest'],
                computed: {
                    text: function() {
                        return `I've been clicked ${this.clickedTimes} times.`;
                    }
                },
                methods: {
                    OnClickBtn: function() {
                        this.clickedTimes++;
                    }
                }
            });
        });
    }
};