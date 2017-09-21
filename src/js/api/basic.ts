import { App } from "../app";
import * as $ from "jquery";

export class Basic {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    public getVersion() {
        return $.ajax({
            url: `${this._base}/portal/version`,
            method: 'GET',
            contentType: "application/json; charset=utf-8"
        });
    }
}