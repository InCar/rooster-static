import * as Vue from "vue";
import * as $ from "jquery";
import { App, VuePage } from "../app";
import { AppAPI, XApp } from "../api/appAPI";

export = class AppOnePage extends VuePage {
    // API
    private _apiApp = new AppAPI();
    // VUE�ⲿ������
    private props = ['args', 'rest'];

    constructor() {
        super();

        // �趨
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
        // ��ѯAPP����
        var apiApp: AppAPI = this.$options._apiApp;

        const token = App.getToken();
        var app = await apiApp.getApp(token, this.args.oid, this.args.appId);
        Vue.set(this, "app", app);
    };

    private computed = {
        appPath: function () { return `/org/${this.args.oid}/app`; }
    };
}