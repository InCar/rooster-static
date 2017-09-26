import { App } from "../app";
import * as $ from "jquery";

export class OrgAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    // ��ѯ���е���֯
    public getAllMyOrgs(token: string) {
        return $.ajax({
            url: `${this._base}/portal/org/all`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        }).then((data:Array<any>) => {
            return data.map((d) => { return new Org(d); });
        });
    }

    // ������֯
    public createOrg(token: string, orgName: string) {
        return $.ajax({
            url: `${this._base}/portal/org/create`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                name: orgName
            })
        }).then((data) => {
            return new Org(data);
        });
    }

    // ɾ����֯
    public deleteOrg(token: string, org: Org) {
        return $.ajax({
            url: `${this._base}/portal/org/delete`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token,
                oid: org.id
            })
        }).then((data) => {
            return 0;
        });
    }
}

export class Org {
    public name: string;
    public id: number;
    public ts: Date;
    public ownerUserId: string;

    public constructor(src) {
        if (src) {
            this.name = src.name;
            this.id = src.id;
            this.ts = new Date(src.ts);
            this.ownerUserId = src.ownerUserId;
        }
    }
}