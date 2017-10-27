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
            app: {},
            feature: {
                add: {
                    target: [] // 目标的层级结构
                }
            }
        };
    };

    private mounted = async function () {
        // 查询APP详情
        var apiApp: AppAPI = this.$options._apiApp;
        var apiCls: ClassAPI = this.$options._apiCls;

        const token = App.getToken();
        var app = await apiApp.getApp(token, this.args.oid, this.args.appId);
        Vue.set(this, "app", app);

        // 监控弹出框
        var vthis = this;
        $("#dialog-add-feature").on("show.bs.modal", async () => {
            if (vthis.feature.add.target.length == 0) {
                // 加载顶层分类
                var top = await apiCls.getTop();
                vthis.feature.add.target.push(top)
            }
        });
    };

    private computed = {
        appPath: function () { return `/org/${this.args.oid}/app`; },
        appOnePath: function () { return `/org/${this.args.oid}/app/${this.args.appId}` },
        subCls: function () {
            if (this.feature.add.target.length == 0) return [];
            else {
                var target = this.feature.add.target;
                var cur = target[target.length - 1];
                if (cur.children) return cur.children
                else return []
            }
        }
    };

    protected methods = {
        save: async function () {
            var apiApp: AppAPI = this.$options._apiApp;
            var token = App.getToken();
            await apiApp.saveApp(token, this.app);
            App.jump(this.appOnePath);
        },
        onClickTarget: async function (cls) {
            var apiCls: ClassAPI = this.$options._apiCls;
            // 选择了一个子项
            if (!cls.children) {
                var clsEx = await apiCls.get(cls.key);
                cls.children = clsEx.children;

                if (!cls.children) cls.children = [];
            }
            this.feature.add.target.push(cls);
        },
        onClickTargetParent: function (i) {
            this.feature.add.target.splice(i + 1, this.feature.add.target.length - (i + 1));
        }
    };
}