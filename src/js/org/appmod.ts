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
                change: {},
                add: {
                    target: [], // 目标的层级结构
                    curDM: null,
                    mapDM: { slim: {}, std: {}, ext: {} },
                    curSTD: 0,
                    curV: null
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
        },
        curCls: function () {
            if (this.feature.add.target.length == 0) return {};
            else {
                var target = this.feature.add.target;
                var cur = target[target.length - 1];
                return cur;
            }
        },
        realms: function () {
            return this.curCls.dm;
        }
    };

    protected methods = {
        save: async function () {
            var apiApp: AppAPI = this.$options._apiApp;
            var token = App.getToken();
            await apiApp.saveApp(token, this.app);

            //TODO: save....

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

            // reset
            this.feature.add.mapDM = { slim: {}, std: {}, ext: {} };
            Vue.set(this.feature.add, "curDM", null);
            Vue.set(this.feature.add, "curSTD", 0);
            Vue.set(this.feature.add, "curV", null);
        },
        onClickTargetParent: function (i) {
            this.feature.add.target.splice(i + 1, this.feature.add.target.length - (i + 1));

            // reset
            this.feature.add.mapDM = { slim: {}, std: {}, ext: {} };
            Vue.set(this.feature.add, "curDM", null);
            Vue.set(this.feature.add, "curSTD", 0);
            Vue.set(this.feature.add, "curV", null);
        },
        chooseDM: async function (dm) {
            var apiCls: ClassAPI = this.$options._apiCls;

            this.feature.add.curDM = dm;
            var listDM: Array<any> = await apiCls.getRealms(dm);
            // 重新组织一下 level
            var mapDM = this.feature.add.mapDM;
            listDM.forEach((d) => {
                // group by level
                var ver = `${d.ver.major}.${d.ver.minor}.${d.ver.fix}`;
                if (d.level == 1) Vue.set(mapDM.slim, ver, d);
                else if (d.level == 2) Vue.set(mapDM.std, ver, d);
                else Vue.set(mapDM.ext, ver, d);
            });

            // 移掉空的集合
            Object.keys(mapDM).forEach((k) => {
                if (Object.keys(mapDM[k]).length == 0) {
                    Vue.delete(mapDM, k);
                }
            });
        },
        stdName: function (s) {
            if (s == "slim") return "精简";
            else if (s == "std") return "标准";
            else return "扩展";
        },
        stdName2: function (s) {
            if (s == "1") return "精简";
            else if (s == "2") return "标准";
            else return "扩展";
        },
        chooseSTD: function (s) {
            this.feature.add.curSTD = s;
        },
        chooseV: function (v) {
            this.feature.add.curV = v;
        },
        addFeature: function (t, s, v) {
            var feature = this.feature.add.mapDM[s][v];

            if (!this.feature.change[t.key]) {
                Vue.set(this.feature.change, t.key, { target: t, realm: {} });
            }

            if (!this.feature.change[t.key]["realm"][feature.id]) {
                // 这表明是一个新加上去的功能
                Vue.set(this.feature.change[t.key]["realm"], feature.id, feature);
                Vue.set(this.feature.change[t.key]["realm"][feature.id], "status", "add");
            }
            else {
                var old = this.feature.change[t.key]["realm"][feature.id];
                if (old.level != feature.level
                    || old.ver.major != feature.ver.major || old.ver.minor != feature.ver.minor || old.ver.fix != feature.ver.fix) {
                    // TODO: 这表明功能的级别或版本号有变化，暂时还不支持这样的修改

                }
                else {
                    // 没变化
                }
            }

            $("#dialog-add-feature")['modal']("hide");
        }
    };
}