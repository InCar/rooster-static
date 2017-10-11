import { App } from "../app";
import * as $ from "jquery";

export class UserAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
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
        }).then((data) => {
            if (!data) return null;
            return new UserLogin(data);
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
        }).then((data) => {
            if (!data) return null;
            return new User(data);
        });
    }

    public logout(token: string){
        return $.ajax({
            url: `${this._base}/portal/user/logout`,
            method: 'DELETE',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        });
    }
}

export class User {
    public id: string;
    public nick: string;
    public headUrl: string;
    public gender: string;
    public birthYear: string;
    public city: string;
    public province: string;

    public constructor(src) {
        if (src) {
            this.id = src.id;
            this.nick = src.nick;
            this.headUrl = src.headUrl;
            this.gender = src.gender;
            this.birthYear = src.birthYear;
            this.city = src.city;
            this.province = src.province;
        }
    }
}

export class UserLogin extends User{
    public token: string;

    public constructor(src) {
        super(src);

        if (src) {
            this.token = src.token;
        }
    }
}