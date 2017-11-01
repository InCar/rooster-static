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
        var listRealms:Array<any> = await $.ajax({
            url: `${this._base}/portal/realm/${key}`,
            method: 'GET'
        });

        return listRealms.map((d) => {
            return new Realm(d);
        })
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

export class Realm {
    public id: string;
    public chs: string;
    public level: number;
    public ver: RealmVer;
    public funcs: Array<RealmFunc>;

    public constructor(src?:any) {
        if (src) {
            this.id = src.id;
            this.chs = src.chs;
            this.level = Number(src.level);
            this.ver = new RealmVer(src.ver);
            this.funcs = src.funcs.map((d) => { return new RealmFunc(d); });
        }
    }
}

export class RealmVer {
    public major: number;
    public minor: number;
    public fix: number;

    public constructor(src?:any) {
        if (src) {
            this.major = src.major;
            this.minor = src.minor;
            this.fix = src.fix;
        }
    }

    public version() {
        return `${this.major}.${this.minor}.${this.fix}`;
    }
}

export class RealmFunc {
    public url: string;
    public chs: string;
    public httpMethod: string;

    public constructor(src?: any) {
        if (src) {
            this.url = src.url;
            this.chs = src.chs;
            this.httpMethod = src.httpMethod;
        }
    }
}