import { App } from "../app";
import * as $ from "jquery";

export class AppAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    // create app
    public createApp(token: string, oid: number, name: string, baseUrl:string) {
        return $.ajax({
            url: `${this._base}/portal/org/${oid}/app/create`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                name,
                baseUrl
            })
        }).then((data: any) => {
            var app = new XApp();
            app.appId = data.id;
            app.name = data.name;
            app.baseUrl = data.base;
            app.ownerUserId = data.uid;
            app.oid = data.oid;
            return app;
        });
    }

    // delete app
    public deleteApp(token: string, oid: number, appId: string) {
        return $.ajax({
            url: `${this._base}/portal/org/${oid}/app/delete`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                appId
            })
        }).then((data: XApp) => {
            return 0;
        });
    }

    // get app list
    public getApps(token: string, oid: number) {
        return $.ajax({
            url: `${this._base}/portal/org/${oid}/app`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        }).then((data: Array<any>) => {
            return data.map((d) => {
                var app = new XAppNameOnly()
                app.appId = d.id;
                app.name = d.name;
                return app;
            });
        });
    }

    // get app
    public getApp(token: string, oid: number, appId: string) {
        return $.ajax({
            url: `${this._base}/portal/org/${oid}/app/${appId}`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        }).then((data: any) => {
            var app = new XApp();
            app.appId = data.id;
            app.name = data.name;
            app.baseUrl = data.base;
            app.ownerUserId = data.uid;
            app.oid = data.oid;
            return app;
        });
    }

    // save app
    public async saveApp(token: string, app: XApp) {
        var ret = await $.ajax({
            url: `${this._base}/portal/org/${app.oid}/app/mod`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                app
            })
        });
        return ret;
    }
}

export class XAppNameOnly {
    public name: string;
    public appId: string;
    public ownerUserId: string;
    public oid: number;

    public constructor(src?: XAppNameOnly) {
        if (src) {
            this.name = src.name;
            this.appId = src.appId;
            this.ownerUserId = src.ownerUserId
            this.oid = src.oid;
        }
    }
}

export class XApp extends XAppNameOnly {
    public baseUrl: string;

    public constructor(src?: XApp) {
        super(src)
        if (src) {
            this.baseUrl = src.baseUrl;
        }
    }
}