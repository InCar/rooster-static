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
            stack: [],
            qq: window['settings'].qq,
            user: {}
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
                    $.cookie("token", `${user.Id}${user.token}`, { path: '/' });
                },
                logout: function(){
                    // 注销
                    var token = $.cookie("token");
                    if (token) {
                        apiUser.logout(token);
                    }
                    $.removeCookie("token");
                    Vue.set(this['user'], "Id", "");
                }
            },
            computed: {
                isLogin: function () {
                    // 用user.Id来判断是否已经处于登录状态
                    if (this['user'].Id) return true;
                    else return false;
                }
            },
            components: {
                'home': App.AsyncComp("home/home"),
                'about': App.AsyncComp("about/about"),
                'org': App.AsyncComp("org/org"),
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
                    apiUser.findUserByToken(token).then((user) => {
                        if (user) {
                            // token有效
                            vthis.user = Object.assign({}, vthis.user, user);
                        }
                        else {
                            // token无效
                            $.removeCookie("token")
                        }
                    })
                }
                
            }
        });

        // mount vue
        this._vueRoot.$mount(this._rootElement);

        // switch components according location
        this.switch();
    };

    private switch() {
        var stack = window.location.pathname.split("/");
        stack.shift();

        // resolve mount
        if (stack.length > 0 && stack[0] && stack[0].length > 0) {
            this._vueRoot['mount'] = stack[0];
        }
        else {
            // default to home
            this._vueRoot['mount'] = 'home';
        }

        // resolve stack
        stack.shift();
        this._vueRoot['stack'] = stack;
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

    public static getToken() { return $.cookie("token"); }

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