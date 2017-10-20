import * as Vue from "vue";
import * as $ from "jquery";
import { App } from "../app";
import { OrgAPI } from "../api/orgAPI";
import { AppAPI } from "../api/appAPI";

export = class OrgPage {
    private _apiOrg = new OrgAPI();
    private _apiApp = new AppAPI();

    constructor() {
    }

    public init(resolve, reject) {
        var apiOrg = this._apiOrg;
        var apiApp = this._apiApp;

        requirejs(['text!org/org.html'], (template) => {
            resolve({
                name: "OrgPage",
                template,
                data: () => {
                    return {
                        listOrgs: [],
                        newOrgName: "",
                        deletingOrg: {}
                    }
                },
                props: ['rest'],
                mounted: function () {
                    document.title = "英卡车云 - 组织";
                    var vthis = this;
                    var token = App.getToken();
                    apiOrg.getAllMyOrgs(token).then((data) => {
                        data.forEach((o) => {
                            o["appCount"] = "?";
                            vthis.listOrgs.push(o);
                            // 查询APP数目
                            var fnCheckAppCount = async (oid:number)=>{
                                var listApps = await apiApp.getApps(token, oid);
                                o["appCount"] = listApps.length;
                            };
                            fnCheckAppCount(o.id);
                        });
                    });
                },
                methods: {
                    createOrg: function (dlg) {
                        var vthis = this;
                        var token = App.getToken();
                        apiOrg.createOrg(token, this.newOrgName)
                            .then((o) => {
                                vthis.newOrgName = "";
                                vthis.listOrgs.push(o);
                                vthis.listOrgs.sort((l, r) => { return l.id >= r.id });
                                $(`#${dlg}`)['modal']('hide');
                            }, (ex) => {
                                console.error(ex);
                            });
                    },
                    confirmDelOrg: function (dlg, o) {
                        this.deletingOrg = o;
                        $(`#${dlg}`)['modal']('show');
                    },
                    deleteOrg: function (dlg, o) {
                        var vthis = this;
                        var token = App.getToken();
                        apiOrg.deleteOrg(token, o)
                            .then(() => {
                                var idx = vthis.listOrgs.indexOf(o);
                                vthis.listOrgs.splice(idx, 1);
                                $(`#${dlg}`)['modal']('hide');
                            }, (ex) => {
                                console.error(ex);
                            });
                    },
                    jump: function (oid: number, target: string) {
                        App.jump(`${document.location.href}/${oid}/${target}`);
                    }
                }
            });
        });
    }
};