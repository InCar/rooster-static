import * as Vue from "vue";
import * as $ from "jquery";
import { App } from "../app";
import { OrgAPI } from "../api/orgAPI";

export = class AppPage {
    private _apiOrg = new OrgAPI();

    constructor() {
    }

    public init(resolve, reject) {
        var apiOrg = this._apiOrg;

        requirejs(['text!org/app.html'], (template) => {
            resolve({
                name: "AppPage",
                template,
                data: () => {
                    return {
                    }
                },
                props: ['rest', 'args'],
                mounted: function () {
                },
                methods: {
                }
            });
        });
    }
};