"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const Auth_1 = require("../entity/Auth");
const KEY_MAP = {
    "pre-key": "preKeys",
    session: "sessions",
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
};
class AuthHandle {
    constructor(ds, key) {
        this.ds = ds;
        this.key = key;
        this.repos = {
            auth: this.ds.getRepository(Auth_1.Auth),
        };
        this.useAuthHandle = () => __awaiter(this, void 0, void 0, function* () {
            let creds;
            let keys = {};
            var existingAuth = yield this.repos.auth.findOneBy({
                key: this.key,
            });
            ({ creds, keys } =
                existingAuth && existingAuth.value
                    ? JSON.parse(existingAuth.value, baileys_1.BufferJSON.reviver)
                    : {
                        creds: (0, baileys_1.initAuthCreds)(),
                        keys: {},
                    });
            const saveState = () => this.repos.auth.upsert({
                key: this.key,
                value: JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer, 2),
            }, {
                conflictPaths: ["key"],
            });
            return {
                state: {
                    creds,
                    keys: {
                        get: (type, ids) => {
                            const key = KEY_MAP[type];
                            return ids.reduce((dict, id) => {
                                var _a;
                                let value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                                if (value) {
                                    if (type === "app-state-sync-key")
                                        value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                                    dict[id] = value;
                                }
                                return dict;
                            }, {});
                        },
                        set: (data) => __awaiter(this, void 0, void 0, function* () {
                            for (const _key in data) {
                                const key = KEY_MAP[_key];
                                keys[key] = keys[key] || {};
                                Object.assign(keys[key], data[_key]);
                            }
                            yield saveState();
                        }),
                    },
                },
                saveState,
            };
        });
    }
}
exports.default = AuthHandle;
//# sourceMappingURL=AuthHandle.js.map