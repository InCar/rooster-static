import { App } from "../app";
import * as $ from "jquery";

export class User {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    public loginFromAliPay(query: string) {
        $.ajax({
            url: `${this._base}/api/user/login`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                provider: "alipay",
                query
            })
        });
    }

    public loginFromQQ(code: string) {
        return $.ajax({
            url: `${this._base}/portal/user/login`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                provider: "qq",
                code
            })
        });
    }

    public findUserByToken(token: string) {
        return $.ajax({
            url: `${this._base}/portal/user/token`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        });
    }

    public logout(token: string){
        return $.ajax({
            url: `${this._base}/portal/user/logout`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        });
    }
}