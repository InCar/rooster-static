import * as Vue from "vue";
import * as $ from "jquery";
import { App, VuePage } from "../app";
import { AppAPI, XApp } from "../api/appAPI";
import { ClassAPI } from "../api/classAPI";

export = class AppModPage extends VuePage {
    // API
    private _apiApp = new AppAPI();
    private _apiCls = new ClassAPI();

    // VUE外部绑定特性
    private props = ['args', 'rest'];

    constructor() {
        super();

        // 设定
        this.name = "AppModPage";
        this._templatePath = "org/appmod.html";
        this._enableI18N = false;
    }

    private data = function () {
        return {
            app: {}
        };
    };

    private mounted = async function () {
        // 查询APP详情
        var apiApp: AppAPI = this.$options._apiApp;
        var apiCls: ClassAPI = this.$options._apiCls;

        const token = App.getToken();
        var app = await apiApp.getApp(token, this.args.oid, this.args.appId);
        Vue.set(this, "app", app);
    };

    private computed = {
        appPath: function () { return `/org/${this.args.oid}/app`; },
        appOnePath: function () { return `/org/${this.args.oid}/app/${this.args.appId}` }
    };

    protected methods = {
        save: async function () {
            var apiApp: AppAPI = this.$options._apiApp;
            var token = App.getToken();
            await apiApp.saveApp(token, this.app);
            App.jump(this.appOnePath);
        }
    };
}