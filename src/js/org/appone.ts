import * as Vue from "vue";
import * as $ from "jquery";
import { App, VuePage } from "../app";
import { AppAPI, XApp } from "../api/appAPI";
import { ClassAPI } from "../api/classAPI";

export = class AppOnePage extends VuePage {
    // API
    private _apiApp = new AppAPI();
    private _apiCls = new ClassAPI();

    // VUE外部绑定特性
    private props = ['args', 'rest'];

    constructor() {
        super();

        // 设定
        this.name = "AppOnePage";
        this._templatePath = "org/appone.html";
        this._enableI18N = true;
    }

    private data = function () {
        return {
            app: {}
        };
    };

    private mounted = async function() {
        // 查询APP详情
        var apiApp: AppAPI = this.$options._apiApp;
        var apiCls: ClassAPI = this.$options._apiCls;

        const token = App.getToken();
        var app = await apiApp.getApp(token, this.args.oid, this.args.appId);
        Vue.set(this, "app", app);
    };

    private computed = {
        appPath: function () { return `/org/${this.args.oid}/app`; },
        appModPath: function () { return `/org/${this.args.oid}/app/${this.args.appId}/mod` }
    };

    private filters = {
        lvl: function (value) {
            switch (Number(value)) {
                case 1: return "精简";
                case 2: return "标准";
                case 0: return "NA";
                default:
                    return "扩展";
            }
        }
    };
}