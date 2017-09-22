import { App } from "../app";
import * as $ from "jquery";

export class OrgAPI {
    private _base: string;

    public constructor() {
        this._base = App.getCfg()['api'];
    }

    // 查询所有的组织
    public getAllMyOrgs(token: string) {
        return $.ajax({
            url: `${this._base}/portal/org/all`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                token
            })
        }).then(() => {
            return 5
        });
    }
}