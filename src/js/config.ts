class Config{
    private _debug:boolean;
    private _pathConfig:any;

    public Config(){
        this._debug = false;
    }

    public apply(){
        this._debug = this.checkDebug();
        this._pathConfig = this.loadConfig();

        requirejs.config({
            baseUrl: '/js',
            paths: this._pathConfig,
            shim: {
                'jquery': { exports: '$' },
                'bootstrap': { deps: ['jquery'] },
                'cookie': { deps: ['jquery'] },
                'modernizr': { exports: 'Modernizr' }
            }
        })
    }

    public start(){
        requirejs(['app'], (AppModule)=>{
            let app = new AppModule.App();
            window['app'] = app;
            app.run();
        });
    }

    private checkDebug(){
        // 检查debug变量
        if(localStorage){
            if(localStorage.getItem("debug") == 'true'){
                console.warn("App is starting in DEBUG mode.");
                return true;
            }
        }

        return false;
    }

    private loadConfig(){
        let pathConfig: any;
        if (this._debug) {
            pathConfig = {
                text: ["//cdn.jsdelivr.net/requirejs.text/2.0.12/text", "/lib/requirejs-text/text"],
                jquery: ["//cdn.jsdelivr.net/jquery/3.2.1/jquery", "/lib/jquery/dist/jquery"],
                cookie: ["//cdn.jsdelivr.net/jquery.cookie/1.4.1/jquery.cookie", "/lib/jquery.cookie/jquery.cookie"],
                bootstrap: ["//cdn.jsdelivr.net/bootstrap/3.3.7/js/bootstrap", "/lib/bootstrap/dist/js/bootstrap"],
                bluebird: ["//cdn.jsdelivr.net/bluebird/3.5.0/bluebird", "/lib/bluebird/js/browser/bluebird"],
                vue: ["//cdn.jsdelivr.net/vue/2.3.2/vue", "/lib/vue/dist/vue"]
            };
        }
        else {
            pathConfig = {
                text: ["//cdn.jsdelivr.net/requirejs.text/2.0.12/text.min", "/lib/requirejs-text/text.min"],
                jquery: ["//cdn.jsdelivr.net/jquery/3.2.1/jquery.min", "/lib/jquery/dist/jquery.min"],
                cookie: ["//cdn.jsdelivr.net/jquery.cookie/1.4.1/jquery.cookie.min", "/lib/jquery.cookie/jquery.cookie.min"],
                bootstrap: ["//cdn.jsdelivr.net/bootstrap/3.3.7/js/bootstrap.min", "/lib/bootstrap/dist/js/bootstrap/bootstrap.min"],
                bluebird: ["//cdn.jsdelivr.net/bluebird/3.5.0/bluebird.min", "/lib/bluebird/js/browser/bluebird.min"],
                vue: ["//cdn.jsdelivr.net/vue/2.3.2/vue.min", "/lib/vue/dist/vue.min"]
            };
        }
        pathConfig['modernizr'] = "/lib/modernizr";

        // pathConfig = this.useBackupConfig(pathConfig);

        return pathConfig;
    }

    private useBackupConfig(config) {
        // 对调CDN和Local
        for (var i in config) {
            if (Array.isArray(config[i]) && config[i].length >= 2) {
                var t = config[i];
                var exc = t[0];
                t[0] = t[1];
                t[1] = exc;
            }
        }

        return config;
    }
}

var config = new Config();
config.apply();
config.start();