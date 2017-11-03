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
            target: {}, // 目标对象层级结构
            listTarget: [], // 父级呈现
            dm: {},     // 数据领域层级结构
            curT: null,
            curD: { dm: null, level: 0, v: null }
        };
    };

    private mounted = async function () {
        // 查询APP详情
        var apiApp: AppAPI = this.$options._apiApp;
        var apiCls: ClassAPI = this.$options._apiCls;

        const token = App.getToken();
        var app = await apiApp.getApp(token, this.args.oid, this.args.appId);
        Vue.set(this, "app", app);

        // 弹出
        var vthis = this;
        $("#dialog-add-feature").on("show.bs.modal", async () => {
            // 初始化顶层目标对象
            if (!Object.keys(vthis.target).length) {
                var top = await apiCls.getTop();
                Vue.set(vthis, "target", top);
                Vue.set(vthis, "curT", top);
                vthis.listTarget.push(top);
            }
        });
    };

    private computed = {
        appPath: function () { return `/org/${this.args.oid}/app`; },
        appOnePath: function () { return `/org/${this.args.oid}/app/${this.args.appId}` },
        dmNow: function () {
            if (this.curD.v != null) return this.dm[this.curD.dm][this.curD.level][this.curD.v];
            else return {};
        }
    };

    private watch = {
        curT: function (value) {
            var vthis = this;
            var apiCls: ClassAPI = this.$options._apiCls;
            // 加载所有还没有加载详情的dm
            value.dm.forEach(async (dm: string) => {
                if (!vthis.dm[dm]) {
                    var listDM = await apiCls.getRealms(dm);
                    // 按level重新组织一下
                    var mapDM = {};
                    listDM.forEach((d) => {
                        if (!mapDM[d.level]) mapDM[d.level] = {};
                        mapDM[d.level][d.ver.version()] = d;
                    });
                    Vue.set(vthis.dm, dm, mapDM);
                }
            });
        }
    };

    protected methods = {
        save: async function () {
            const apiApp: AppAPI = this.$options._apiApp;
            const token = App.getToken();

            // 保存基本信息
            await apiApp.saveApp(token, this.app);

            // 功能
            const app = this.app;
            Object.keys(app.abi).forEach((target) => {
                Object.keys(app.abi[target]).forEach(async (realm) => {
                    const feature = app.abi[target][realm];
                    if (feature.status == "add") {
                        const ability = {
                            target,
                            realm,
                            level: feature.level,
                            version: feature.ver
                        };
                        await apiApp.addAbility(token, this.app.oid, this.app.appId, ability);
                    }
                });
            });
            

            App.jump(this.appOnePath);
        },
        chooseChild: async function (cls) {
            var apiCls: ClassAPI = this.$options._apiCls;

            if (cls.children == undefined) Vue.set(cls, "children", null);

            this.listTarget.push(cls);
            this.curT = cls;
            this.resetDM();

            // 延迟加载子项
            if (!cls.children) {
                var clsEx = await apiCls.get(cls.key);
                if (!clsEx.children) clsEx.children = [];
                cls.children = clsEx.children;
            }
        },
        chooseParent: function (i) {
            this.listTarget.splice(i + 1, this.listTarget.length);
            this.curT = this.listTarget[i];

            // reset
            this.resetDM();
        },
        resetDM: function () {
            this.curD.v = null;
            this.curD.level = 0;
            this.curD.dm = null;
        },
        chooseDM: function (dm) {
            this.curD.dm = dm;
        },
        chooseLvl: function (level) {
            this.curD.level = level;
        },
        chooseV: function (v) {
            this.curD.v = v;
        },
        addAbility: function (dlg, target, dm) {
            // 对于应用而言,1个对象的1个领域只能支持1套(1个级别的1个版本)功能
            if (!this.app.abi[target.key]) {
                Vue.set(this.app.abi, target.key, {});
            }

            if (!this.app.abi[target.key][dm.id]) {
                // 这表明是一个新加上去的功能
                Vue.set(this.app.abi[target.key], dm.id, dm);
                Vue.set(this.app.abi[target.key][dm.id], "status", "add");
            }
            else {
                // 表明有变化,暂时不支持
            }

            $(`#${dlg}`)['modal']("hide");
            this.resetDM();
        }
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