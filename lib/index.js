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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthHandle_1 = __importDefault(require("./bottle/AuthHandle"));
const StoreHandle_1 = __importDefault(require("./bottle/StoreHandle"));
const DB_1 = __importDefault(require("./DB"));
const Auth_1 = require("./entity/Auth");
class BaileysBottle {
    constructor() {
        this.createStore = (ds, storeName, options) => __awaiter(this, void 0, void 0, function* () {
            var store = yield ds.getRepository(Auth_1.Auth).findOne({
                where: { key: storeName },
            });
            if (!store)
                store = yield ds.getRepository(Auth_1.Auth).save({
                    key: storeName,
                    value: "",
                    chats: [],
                    contacts: [],
                    groups: [],
                    messageDics: [],
                    presenceDics: [],
                });
            return {
                auth: new AuthHandle_1.default(ds, storeName),
                store: new StoreHandle_1.default(ds, store, options),
                _ds: ds,
            };
        });
        this.init = (db, options) => __awaiter(this, void 0, void 0, function* () {
            return ({
                createStore: (...args) => __awaiter(this, void 0, void 0, function* () { return this.createStore.apply(null, [yield DB_1.default.get(db, options), ...args]); }),
            });
        });
    }
}
BaileysBottle.instance = new BaileysBottle();
exports.default = BaileysBottle.instance;
//# sourceMappingURL=index.js.map