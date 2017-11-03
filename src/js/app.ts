import "bootstrap";
import "cookie";
import * as $ from "jquery";
import * as Modernizr from "modernizr";
import * as Vue from "vue";
import { BasicAPI } from "./api/basicAPI";
import { UserAPI } from "./api/userAPI";

export class App{
    private _rootElement = "#rootLayout";
    protected _vueRoot: Vue;

    private _apiBasic = new BasicAPI();
    private _apiUser = new UserAPI();
    

    public App(){}

    public run() {
        // lang
        var lang = "text!/index-" + App.lang() + ".json";

         // 对于不支持promise的平台,填充bluebird
        if (!Modernizr.promises) {
            requirejs(["bluebird", lang], (Promise, txt) => {
                window['Promise'] = Promise;
                this.startApp(txt);
            });
        }
        else {
            // 启动
            requirejs([lang], (txt) => {
                this.startApp(txt);
            });
        }
    }

    private startApp = (txt: string) => {
        var apiBasic = this._apiBasic;
        var apiUser = this._apiUser;

        var data = {
            version: { front: "MARK_GIT_VERSION", back: {} },
            mount: "home",
            rest: "",
            args: {},
            qq: window['settings'].qq,
            user: {},
            checking: true
        };

        // boostrap的navbar在小屏上的点击菜单后,直接隐匿菜单效果
        this.patchNavBar();
        // 使得站内的Anchor不刷新页面
        this.patchAnchor();
        // 国际化
        data = this.patchLangJson(data, txt);

        this._vueRoot = new Vue({
            data,
            methods: {
                setLang: (lang) => {
                    $.cookie("lang", lang, { path: '/' });
                    window.location.reload();
                },
                onLogin: function(user){
                    this['user'] = Object.assign({}, this['user'], user);
                    $.cookie("token", `${user.id}${user.token}`, { path: '/' });
                },
                logout: function(){
                    // 注销
                    var token = $.cookie("token");
                    if (token) {
                        apiUser.logout(token);
                    }
                    $.removeCookie("token");
                    Vue.set(this['user'], "id", "");
                }
            },
            computed: {
                isLogin: function () {
                    // 用user.id来判断是否已经处于登录状态
                    if (this['user'].id) return true;
                    else return false;
                }
            },
            components: {
                'home': App.AsyncComp("home/home"),
                'about': App.AsyncComp("about/about"),
                'org': App.AsyncComp("org/org"),
                'org/{oid}/app': App.AsyncComp("org/app"),
                'org/{oid}/app/{appId}': App.AsyncComp("org/appone"),
                'org/{oid}/app/{appId}/mod': App.AsyncComp("org/appmod"),
                'demo': App.AsyncComp("demo/demo"),
                '3rd': App.AsyncComp("3rd/3rd")
            },
            mounted: function () {
                var vthis:any = this;
                // check version
                apiBasic.getVersion().then((ver) => {
                    Vue.set(vthis.version, "back", ver);
                });

                // check cookie token for user
                var token = $.cookie("token");
                if (token) {
                    vthis.checking = true;
                    apiUser.findUserByToken(token).then((user) => {
                        vthis.checking = false;
                        if (user) {
                            // token有效
                            vthis.user = Object.assign({}, vthis.user, user);
                        }
                        else {
                            // token无效
                            $.removeCookie("token", { path: '/' })
                        }
                    }, (ex) => {
                        vthis.checking = false;
                        console.error(ex);
                    })
                }
                else {
                    vthis.checking = false;
                }
            }
        });

        // mount vue
        this._vueRoot.$mount(this._rootElement);

        // switch components according location
        var vthis = this;
        this.switch();
        window.onpopstate = (ev) => {
            this.switch();
        };
        $(document).on("jump", function (e, url) {
            history.pushState(null, null, url);
            vthis.switch();
        });
    };

    private switch() {
        // 按最贪心匹配,没匹配的部分成为rest
        var matched = App.bestMatch(window.location.pathname, Object.keys(this._vueRoot.$options.components));

        this._vueRoot['mount'] = matched.key;
        this._vueRoot['rest'] = matched.rest;
        this._vueRoot['args'] = matched.args;
    }

    private patchAnchor() {
        const xthis = this;
        const evClick: any = "click";
        $(document).on(evClick, "a", function (e: Event) {
            // https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
            var anchor = document.createElement('a');
            anchor['href'] = location.href;

            if (anchor['origin'] == this['origin']) { // 是一个站内Anchor
                e.preventDefault();
                if (anchor['pathname'] != this['pathname'] || anchor['search'] != this['search']) {
                    window.history.pushState(null, null, this['href']);
                    xthis.switch();
                }
            }
        });
    }

    private patchNavBar() {
        $("#navbar li:not(.dropdown)>a").attr("data-target", "#navbar.in");
        $("#navbar li:not(.dropdown)>a").attr("data-toggle", "collapse");
    }
    
    private patchLangJson(data, txt:string) {
        var jsonTxt = JSON.parse(txt);
        document.title = jsonTxt["title"];
        for (var k in jsonTxt) {
            if (!data[k]) data[k] = jsonTxt[k];
        }

        data.languages = {
            "zh": "中文",
            "en": "English"
        };

        data.lang = data.languages[App.lang()];

        return data;
    }

    public static lang() {
        // 所有支持的语言
        const languages = ["zh", "en"];

        var lan = null;

        // 优先从cookie中取值
        lan = $.cookie("lang");
        if (lan) {
            if ($.inArray(lan, languages) >= 0) return lan;
        }

        // 再从浏览器中取值
        if (navigator["languages"]) {
            $.each(navigator["languages"], (k, v) => {
                if ($.inArray(v, languages) >= 0) {
                    lan = v;
                    return false;
                }
            });
        }
        if (lan) {
            if ($.inArray(lan, languages) >= 0) return lan;
        }

        // IE9
        lan = navigator.language || navigator["userLanguage"];
        if ($.inArray(lan, languages) >= 0) return lan;

        // 最后的缺省值
        return languages[0];
    }

    public static getQuery(name:string, url?:string) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    public static getCfg() { return window["settings"]; }

    public static getToken(): string { return $.cookie("token"); }

    public static jump(url: string) {
        $(document).trigger("jump", url);
    }

    public static bestMatch(path, keys) {
        var segPath = path.split("/");
        segPath.shift();

        var matchIdx = 0;
        var matchKey = "home";
        var args: any = {};

        keys.forEach((key) => {
            var matched = 0;
            var argx = {};
            var segKey = key.split("/");

            if (segKey.length <= segPath.length) {
                // path可以有剩余部分,而key必须得全部匹配上
                for (var i = 0; i < segKey.length; i++) {
                    var k = segKey[i];
                    if (k.length > 2 && k[0] == "{" && k[k.length - 1] == "}") {
                        // 参数,匹配度直接增加
                        argx[k.substring(1, k.length - 1)] = segPath[i];
                        matched++;
                    }
                    else {
                        if (segPath[i].toUpperCase() == k.toUpperCase()) {
                            matched++
                        } else {
                            matched = 0;
                            break;
                        }
                    }
                }

                if (matched > matchIdx) {
                    // 找到了匹配程度更高的
                    matchIdx = matched;
                    matchKey = key;
                    args = argx;
                }
            }
        });

        // 余下的部分
        var rest = "";
        if (segPath.length > matchIdx) {
            rest = segPath.slice(matchIdx).join("/");
        }

        const m = {
            key: matchKey,
            rest,
            args
        };

        return m;
    }


    public static extends(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    public static AsyncComp(comp: string, args?) {
        return (resolve, reject) => {
            requirejs([comp], (factoryComp) => {
                var obj = new factoryComp(args);
                obj.init(resolve, reject);
            });
        }
    }
}

export class VuePage {
    // 模板路径
    protected _templatePath: string;
    // 国际化支持
    protected _enableI18N = true;
    // VUE名称,派生类修改为自己的名称
    protected name = "VuePage";
    // VUE模板内容,变量名必须得是template,VUE规定的,不可以变更
    protected template: string;
    // VUE方法,变量名必须得是methods,VUE规定的不可以变更
    protected methods: any = {};

    public init(resolve, reject) {
        // async loading
        var loads = [];

        // 如果模板路径有效,加载它,否则不加载
        var tpl = this._templatePath;
        if (tpl) {
            loads.push(`text!${tpl}`);

            // 如果开启i18n支持,加载对应的语言 filename.ext -> filename-zh.json
            if (this._enableI18N) {
                var jsonI18N = tpl.replace(/\.\w+$/i, `-${App.lang()}.json`)
                loads.push(`text!${jsonI18N}`);
            }
            
        }

        requirejs(loads, (template, txt) => {
            if (template) {
                this.template = template;
                if (txt) {
                    const lang = JSON.parse(txt);
                    this.methods['i18n'] = function (value) { return lang[value]; }
                }
            }

            resolve(this);
        });        
    }
}