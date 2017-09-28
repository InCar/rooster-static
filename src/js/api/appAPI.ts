import { App } from "../app";
import * as $ from "jquery";

export class AppAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    // create app
    public createApp(token: string, name: string; baseUrl:string) {
        return $.ajax({
            url: `${this._base}/portal/app/create`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                name,
                baseUrl
            })
        }).then((data: XApp) => {
            return new XApp(data);
        });
    }
}

export class XApp {
    public name: string;
    public appId: string;
    public ownerUserId: string;
    public oid: number;
    public baseUrl: string;

    public constructor(src?: XApp) {
        if (src) {
            this.name = src.name;
            this.appId = src.appId;
            this.ownerUserId = src.ownerUserId
            this.oid = src.oid;
            this.baseUrl = src.baseUrl;
        }
    }
}