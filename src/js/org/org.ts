import * as Vue from "vue";
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
                        clickedTimes: 0
                    }
                },
                props: ['stack'],
                computed: {
                    text: function() {
                        return `I've been clicked ${this.clickedTimes} times.`;
                    }
                },
                methods: {
                    OnClickBtn: function() {
                        this.clickedTimes++;
                    }
                },
                mounted: function () {
                    var token = App.getToken();
                    apiOrg.getAllMyOrgs(token).then((data) => {
                        console.info(data);
                    });
                }
            });
        });
    }
};