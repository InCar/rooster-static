import * as Vue from "vue";
import * as $ from "jquery";
import { App } from "../app";
import { OrgAPI } from "../api/orgAPI";

export = class OrgPage {
    private _apiOrg = new OrgAPI();

    constructor() {
    }

    public init(resolve, reject) {
        var apiOrg = this._apiOrg;

        requirejs(['text!org/org.html'], (template) => {
            resolve({
                name: "OrgPage",
                template,
                data: () => {
                    return {
                        listOrgs: [],
                        newOrgName: ""
                    }
                },
                props: ['stack'],
                mounted: function () {
                    var vthis = this;
                    var token = App.getToken();
                    apiOrg.getAllMyOrgs(token).then((data) => {
                        data.forEach((o) => {
                            vthis.listOrgs.push(o);
                            vthis.listOrgs.push(o);
                        });
                    });
                },
                methods: {
                    createOrg: function (dlg) {
                        var vthis = this;
                        var token = App.getToken();
                        apiOrg.createOrg(token, this.newOrgName)
                            .then((o) => {
                                vthis.listOrgs.push(0);
                                $(`#${dlg}`)['modal']('hide');
                            }, (ex) => {
                                console.error(ex);
                            });
                    }
                }
            });
        });
    }
};