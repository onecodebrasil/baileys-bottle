"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const typeorm_1 = require("typeorm");
const Chat_1 = require("./Chat");
const Contact_1 = require("./Contact");
const GroupMetadata_1 = require("./GroupMetadata");
const MessageDic_1 = require("./MessageDic");
const PresenceDic_1 = require("./PresenceDic");
let Auth = class Auth {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Auth.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Auth.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Auth.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Chat_1.Chat, (chat) => chat.DBAuth),
    __metadata("design:type", Array)
], Auth.prototype, "chats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Contact_1.Contact, (contact) => contact.DBAuth),
    __metadata("design:type", Array)
], Auth.prototype, "contacts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GroupMetadata_1.GroupMetadata, (group) => group.DBAuth),
    __metadata("design:type", Array)
], Auth.prototype, "groups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MessageDic_1.MessageDic, (messageDic) => messageDic.DBAuth),
    __metadata("design:type", Array)
], Auth.prototype, "messageDics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PresenceDic_1.PresenceDic, (presenceDic) => presenceDic.DBAuth),
    __metadata("design:type", Array)
], Auth.prototype, "presenceDics", void 0);
Auth = __decorate([
    (0, typeorm_1.Entity)("BaileysAuth"),
    (0, typeorm_1.Unique)(["key"])
], Auth);
exports.Auth = Auth;
//# sourceMappingURL=Auth.js.map