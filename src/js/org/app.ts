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
                        listApps: [],
                        newApp: {},
                        deletingApp: {},
                        deletingAppName: ""
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
                        return apiApp.getApps(token, o.id)
                    }).then((apps) => {
                        apps.forEach((app) => { vthis.listApps.push(app); });
                    });
                },
                methods: {
                    createApp: function (dlg, app: XApp) {
                        var vthis = this;
                        const token = App.getToken();
                        var oid = this.args.oid;
                        apiApp.createApp(token, oid, app.name, app.baseUrl).then((data) => {
                            vthis.listApps.push(data);
                            vthis.listApps.sort((l, r) => { return l.name >= r.name });
                            $(`#${dlg}`)['modal']('hide');
                        });
                    },
                    confirmDelApp: function (dlg, app) {
                        this.deletingApp = app;
                        this.deletingAppName = "";
                        $(`#${dlg}`)['modal']('show');
                    },
                    deleteApp: function (dlg, app, nameChecking) {
                        if (app.name != nameChecking) return;

                        var vthis = this;
                        var token = App.getToken();
                        var oid = this.args.oid;

                        apiApp.deleteApp(token, oid, app.appId)
                            .then(() => {
                                var idx = vthis.listApps.indexOf(app);
                                vthis.listApps.splice(idx, 1);
                                $(`#${dlg}`)['modal']('hide');
                            }, (ex) => {
                                console.error(ex);
                            });
                    },
                }
            });
        });
    }
};