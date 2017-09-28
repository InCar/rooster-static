import * as Vue from "vue";
import * as $ from "jquery";
import { App } from "../app";
import { OrgAPI } from "../api/orgAPI";
import { AppAPI, XApp } from "../api/appAPI";

export = class AppPage {
    private _apiOrg = new OrgAPI();
    private _apiApp = new AppAPI();

    constructor() {
    }

    public init(resolve, reject) {
        var apiOrg = this._apiOrg;
        var apiApp = this._apiApp;

        requirejs(['text!org/app.html'], (template) => {
            resolve({
                name: "AppPage",
                template,
                data: () => {
                    return {
                        org: { id: 0, name: "loading...", },
                        newApp: {}
                    }
                },
                props: ['rest', 'args'],
                mounted: function () {
                    var vthis = this;
                    // fetch info of org
                    const token = App.getToken();
                    apiOrg.getOrg(token, this.args.oid).then((o) => {
                        vthis.org = o;
                        return o;
                    }).then((o) => {
                        // TODO: fetch info of app
                    });
                },
                methods: {
                    createApp: function (dlg, app : XApp) {
                        const token = App.getToken();
                        apiApp.createApp(token, app.name, app.baseUrl).then((data) => {
                            console.info(data);
                            console.info(this);
                        });
                    }
                }
            });
        });
    }
};