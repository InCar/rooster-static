import { App } from "../app";
import * as $ from "jquery";

export class BasicAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    public getVersion() {
        return $.ajax({
            url: `${this._base}/portal/version`,
            method: 'GET',
            contentType: "application/json; charset=utf-8"
        }).then((ver: GitVer) => {
            return ver;
        });
    }
}

export class GitVer{
    public branch: string;
    public rev: number;
    public hash: string;
    public hash160: string;
}