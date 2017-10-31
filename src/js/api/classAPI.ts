import { App } from "../app";
import * as $ from "jquery";

export class ClassAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    public async getTop() {
        var top = await $.ajax({
            url: `${this._base}/portal/class/single/`,
            method: 'GET'
        });

        return new TargetClassAndChildren(top);
    }

    public async get(key: string) {
        var cls = await $.ajax({
            url: `${this._base}/portal/class/single/${key}`,
            method: 'GET'
        });

        return new TargetClassAndChildren(cls);
    }

    public async getRealms(key: string) {
        var listRealms = await $.ajax({
            url: `${this._base}/portal/realm/${key}`,
            method: 'GET'
        });

        return listRealms;
    }
}

export class TargetClass {
    public key: string;
    public name: string;
    public dm: Array<string>;

    public constructor(src) {
        if (src) {
            this.key = src.key;
            this.name = src.chs;
            this.dm = src.dm;
        }
    }
}

export class TargetClassAndChildren extends TargetClass {
    public children: Array<string>

    public constructor(src) {
        super(src);

        if (src) {
            this.children = src.children.map((t) => { return new TargetClass(t); });
        }
    }
}