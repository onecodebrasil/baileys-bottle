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
const typeorm_1 = require("typeorm");
const Auth_1 = require("./entity/Auth");
const Chat_1 = require("./entity/Chat");
const Contact_1 = require("./entity/Contact");
const GroupMetadata_1 = require("./entity/GroupMetadata");
const Message_1 = require("./entity/Message");
const MessageDic_1 = require("./entity/MessageDic");
const Presence_1 = require("./entity/Presence");
const PresenceDic_1 = require("./entity/PresenceDic");
class DB {
    constructor() {
        this.get = (db, options) => __awaiter(this, void 0, void 0, function* () {
            this.dataSource =
                !(options === null || options === void 0 ? void 0 : options.sync) && this.dataSource
                    ? this.dataSource
                    : yield new typeorm_1.DataSource(Object.assign(Object.assign({ synchronize: options === null || options === void 0 ? void 0 : options.sync, migrations: [], logging: options === null || options === void 0 ? void 0 : options.debug, charset: "cp1251_general_ci" }, db), { entities: [
                            Auth_1.Auth,
                            Chat_1.Chat,
                            Contact_1.Contact,
                            GroupMetadata_1.GroupMetadata,
                            MessageDic_1.MessageDic,
                            Message_1.Message,
                            PresenceDic_1.PresenceDic,
                            Presence_1.Presence,
                            ...db.entities,
                        ] })).initialize();
            try {
                yield this.dataSource.getRepository(Auth_1.Auth).find();
            }
            catch (_a) {
                return yield this.get(db, Object.assign(Object.assign({}, options), { sync: true }));
            }
            return this.dataSource;
        });
    }
}
DB.instance = new DB();
exports.default = DB.instance;
//# sourceMappingURL=DB.js.map