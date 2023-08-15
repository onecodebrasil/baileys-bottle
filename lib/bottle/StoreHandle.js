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
const Chat_1 = require("../entity/Chat");
const Contact_1 = require("../entity/Contact");
const Message_1 = require("../entity/Message");
const MessageDic_1 = require("../entity/MessageDic");
const PresenceDic_1 = require("../entity/PresenceDic");
const GroupMetadata_1 = require("../entity/GroupMetadata");
const typeorm_1 = require("typeorm");
class StoreHandle {
    constructor(ds, auth, options) {
        this.ds = ds;
        this.auth = auth;
        this.options = options;
        this.repos = {
            contacts: this.ds.getRepository(Contact_1.Contact),
            chats: this.ds.getRepository(Chat_1.Chat),
            messageDics: this.ds.getRepository(MessageDic_1.MessageDic),
            messages: this.ds.getRepository(Message_1.Message),
            presenceDics: this.ds.getRepository(PresenceDic_1.PresenceDic),
            groups: this.ds.getRepository(GroupMetadata_1.GroupMetadata),
        };
        this.state = { connection: "close" };
        this.chats = {
            all: () => this.repos.chats.findBy({
                DBAuth: {
                    id: this.auth.id,
                },
            }),
            id: (id) => this.repos.chats.findOneBy({
                id,
                DBAuth: {
                    id: this.auth.id,
                },
            }),
        };
        this.contacts = {
            all: () => this.repos.contacts.findBy({
                DBAuth: {
                    id: this.auth.id,
                },
            }),
            id: (id) => this.repos.contacts.findOneBy({
                id,
                DBAuth: {
                    id: this.auth.id,
                },
            }),
        };
        this.messages = {
            all: (jid) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                return (_a = (yield this.repos.messageDics.findOne({
                    where: {
                        jid,
                        DBAuth: {
                            id: this.auth.id,
                        },
                    },
                    relations: ["messages"],
                }))) === null || _a === void 0 ? void 0 : _a.messages;
            }),
            id: (jid, msgId) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                return (_b = (yield this.repos.messageDics.findOne({
                    where: {
                        jid,
                        DBAuth: {
                            id: this.auth.id,
                        },
                    },
                    relations: ["messages"],
                }))) === null || _b === void 0 ? void 0 : _b.messages.find((x) => x.msgId === msgId);
            }),
        };
        this.groupMetadata = {
            all: () => this.repos.groups.findBy({
                DBAuth: {
                    id: this.auth.id,
                },
            }),
            id: (id) => this.repos.groups.findOneBy({
                id,
                DBAuth: {
                    id: this.auth.id,
                },
            }),
        };
        this.presence = {
            all: (id) => __awaiter(this, void 0, void 0, function* () {
                var _c;
                return (_c = (yield this.repos.presenceDics.findOne({
                    where: {
                        id,
                        DBAuth: {
                            id: this.auth.id,
                        },
                    },
                    relations: ["presences"],
                }))) === null || _c === void 0 ? void 0 : _c.presences;
            }),
            id: (id, participant) => __awaiter(this, void 0, void 0, function* () {
                var _d;
                return (_d = (yield this.repos.presenceDics.findOne({
                    where: {
                        id,
                        DBAuth: {
                            id: this.auth.id,
                        },
                    },
                    relations: ["presences"],
                }))) === null || _d === void 0 ? void 0 : _d.presences.find((x) => x.participant === participant);
            }),
        };
        this.contactsUpsert = (newContacts) => __awaiter(this, void 0, void 0, function* () {
            var contacts = yield this.repos.contacts.findBy({
                DBAuth: {
                    id: this.auth.id,
                },
            });
            const oldContacts = new Set(Object.keys(contacts));
            for (const contact of newContacts) {
                oldContacts.delete(contact.id);
                contacts[contact.id] = Object.assign(contacts[contact.id] || { DBAuth: { id: this.auth.id } }, contact);
            }
            yield this.repos.contacts.save(contacts);
            return oldContacts;
        });
        this.assertMessageList = (jid) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.repos.messageDics.findOne({
                where: {
                    jid,
                    DBAuth: {
                        id: this.auth.id,
                    },
                },
                relations: ["messages"],
            })) ||
                (yield this.repos.messageDics.save({
                    jid,
                    DBAuth: { id: this.auth.id },
                    messages: [],
                }));
        });
        this.bind = (ev) => {
            ev.on("connection.update", (update) => Object.assign(this.state, update));
            ev.on("messaging-history.set", ({ chats: newChats, contacts: newContacts, messages: newMessages, isLatest, }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                isLatest &&
                    (yield Promise.all([
                        () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.repos.messageDics.remove(yield this.repos.messageDics.findBy({
                                DBAuth: { id: this.auth.id },
                            }));
                        }),
                        () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.repos.chats.remove(yield this.repos.chats.findBy({ DBAuth: { id: this.auth.id } }));
                        }),
                    ]));
                const oldContacts = yield this.contactsUpsert(newContacts);
                yield this.repos.contacts.delete({
                    id: (0, typeorm_1.In)(Array.from(oldContacts)),
                    DBAuth: { id: this.auth.id },
                });
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid, dictionary = yield this.assertMessageList(jid);
                    let message;
                    if (!(message = dictionary.messages.find((x) => x.key.id === msg.key.id))) {
                        yield this.repos.messages.save(Object.assign(Object.assign({}, msg), { msgId: (_a = msg.key) === null || _a === void 0 ? void 0 : _a.id, dictionary }));
                        continue;
                    }
                    Object.assign(message, msg);
                    yield this.repos.messageDics.save(dictionary);
                }
            }));
            ev.on("contacts.update", (updates) => __awaiter(this, void 0, void 0, function* () {
                for (const update of updates) {
                    let contact;
                    if ((contact = yield this.repos.contacts.findOneBy({
                        id: update.id,
                        DBAuth: { id: this.auth.id },
                    }))) {
                        Object.assign(contact, update);
                        yield this.repos.contacts.save(contact);
                    }
                }
            }));
            ev.on("chats.upsert", (newChats) => this.repos.chats.upsert(Object.assign(Object.assign({}, newChats), { DBAuth: { id: this.auth.id } }), {
                conflictPaths: ["id", "DBAuth"],
            }));
            ev.on("chats.update", (updates) => __awaiter(this, void 0, void 0, function* () {
                for (let update of updates) {
                    var chat = yield this.repos.chats.findOneBy({
                        id: update.id,
                        DBAuth: { id: this.auth.id },
                    });
                    if (!chat)
                        return;
                    if (update.unreadCount > 0) {
                        update = Object.assign({}, update);
                        update.unreadCount = (chat.unreadCount || 0) + update.unreadCount;
                    }
                    Object.assign(chat, update);
                    yield this.repos.chats.save(chat);
                }
            }));
            ev.on("presence.update", ({ id, presences: update }) => __awaiter(this, void 0, void 0, function* () {
                var chat = (yield this.repos.presenceDics.findOne({
                    where: {
                        id,
                        DBAuth: { id: this.auth.id },
                    },
                    relations: ["presences"],
                })) ||
                    {
                        id,
                        presences: [],
                        DBAuth: { id: this.auth.id },
                    };
                Object.entries(update).forEach(([id, presence]) => {
                    var participant = chat.presences.find((x) => x.participant === id);
                    participant
                        ? Object.assign(participant, presence)
                        : chat.presences.push(Object.assign(Object.assign({}, presence), { participant: id }));
                });
                try {
                    yield this.repos.presenceDics.save(chat);
                }
                catch (_b) { }
            }));
            ev.on("chats.delete", (deletions) => __awaiter(this, void 0, void 0, function* () {
                return !this.options.disableDelete.includes("chats") &&
                    Promise.all(deletions.map((id) => this.repos.chats.delete({
                        id,
                        DBAuth: { id: this.auth.id },
                    })));
            }));
            ev.on("messages.upsert", ({ messages: newMessages, type }) => __awaiter(this, void 0, void 0, function* () {
                var _c;
                switch (type) {
                    case "append":
                    case "notify":
                        for (const msg of newMessages) {
                            const jid = (0, baileys_1.jidNormalizedUser)(msg.key.remoteJid);
                            var dictionary = yield this.assertMessageList(jid);
                            let message;
                            if (!(message = dictionary.messages.find((x) => x.key.id === msg.key.id)))
                                return yield this.repos.messages.save(Object.assign(Object.assign({}, msg), { msgId: (_c = msg.key) === null || _c === void 0 ? void 0 : _c.id, dictionary }));
                            Object.assign(message || {}, msg);
                            yield this.repos.messageDics.save(dictionary);
                            type === "notify" &&
                                !(yield this.repos.chats.findOneBy({
                                    id: jid,
                                    DBAuth: { id: this.auth.id },
                                })) &&
                                ev.emit("chats.upsert", [
                                    {
                                        id: jid,
                                        conversationTimestamp: (0, baileys_1.toNumber)(msg.messageTimestamp),
                                        unreadCount: 1,
                                    },
                                ]);
                        }
                        break;
                }
            }));
            ev.on("messages.update", (updates) => __awaiter(this, void 0, void 0, function* () {
                for (const { update, key } of updates) {
                    var dictionary = yield this.assertMessageList(key.remoteJid);
                    let message;
                    if (!(message = dictionary.messages.find((x) => x.key.id === key.id)))
                        continue;
                    Object.assign(message, update);
                    yield this.repos.messageDics.save(dictionary);
                }
            }));
            ev.on("messages.delete", (item) => __awaiter(this, void 0, void 0, function* () {
                if (this.options.disableDelete.includes("messages"))
                    return;
                if ("all" in item) {
                    const dictionary = yield this.repos.messageDics.findOne({
                        where: {
                            jid: item.jid,
                            DBAuth: { id: this.auth.id },
                        },
                        relations: ["messages"],
                    });
                    if (!dictionary)
                        return;
                    this.repos.messages.remove(dictionary.messages);
                }
                else {
                    const jid = item.keys[0].remoteJid;
                    const dictionary = yield this.repos.messageDics.findOne({
                        where: {
                            jid,
                            DBAuth: { id: this.auth.id },
                        },
                        relations: ["messages"],
                    });
                    if (!dictionary)
                        return;
                    const idSet = new Set(item.keys.map((k) => k.id));
                    yield this.repos.messages.remove(dictionary.messages.filter((msg) => Array.from(idSet).includes(msg.msgId)));
                }
            }));
            ev.on("groups.update", (updates) => __awaiter(this, void 0, void 0, function* () {
                for (const update of updates) {
                    const id = update.id;
                    let group = yield this.repos.groups.findOneBy({
                        id,
                        DBAuth: { id: this.auth.id },
                    });
                    if (!group)
                        return;
                    Object.assign(group, update);
                    yield this.repos.groups.save(group);
                }
            }));
            ev.on("group-participants.update", ({ id, participants, action }) => __awaiter(this, void 0, void 0, function* () {
                const metadata = yield this.repos.groups.findOneBy({
                    id,
                    DBAuth: { id: this.auth.id },
                });
                if (!metadata)
                    return;
                switch (action) {
                    case "add":
                        metadata.participants.push(...participants.map((id) => ({
                            id,
                            isAdmin: false,
                            isSuperAdmin: false,
                        })));
                        break;
                    case "demote":
                    case "promote":
                        metadata.participants.forEach((participant) => participants.includes(participant.id) &&
                            (participant.isAdmin = action === "promote"));
                        break;
                    case "remove":
                        metadata.participants = metadata.participants.filter((p) => !participants.includes(p.id));
                        break;
                }
                yield this.repos.groups.save(metadata);
            }));
            ev.on("message-receipt.update", (updates) => __awaiter(this, void 0, void 0, function* () {
                for (const { key, receipt } of updates) {
                    const dictionary = yield this.repos.messageDics.findOne({
                        where: {
                            jid: key.remoteJid,
                            DBAuth: { id: this.auth.id },
                        },
                        relations: ["messages"],
                    });
                    if (!dictionary)
                        return;
                    const msg = dictionary.messages.find((x) => x.key.id === key.id);
                    if (!msg)
                        continue;
                    (0, baileys_1.updateMessageWithReceipt)(msg, receipt);
                    yield this.repos.messageDics.save(dictionary);
                }
            }));
            ev.on("messages.reaction", (reactions) => __awaiter(this, void 0, void 0, function* () {
                for (const { key, reaction } of reactions) {
                    const dictionary = yield this.repos.messageDics.findOne({
                        where: {
                            jid: key.remoteJid,
                            DBAuth: { id: this.auth.id },
                        },
                        relations: ["messages"],
                    });
                    if (!dictionary)
                        return;
                    const msg = dictionary.messages.find((x) => x.key.id === key.id);
                    if (!msg)
                        continue;
                    (0, baileys_1.updateMessageWithReaction)(msg, reaction);
                    yield this.repos.messageDics.save(dictionary);
                }
            }));
        };
        this.loadMessages = (jid, count, cursor) => __awaiter(this, void 0, void 0, function* () {
            const dictionary = yield this.assertMessageList(jid), mode = !cursor || "before" in cursor ? "before" : "after", cursorKey = !!cursor
                ? "before" in cursor
                    ? cursor.before
                    : cursor.after
                : undefined, cursorValue = cursorKey
                ? dictionary.messages.find((x) => x.msgId === cursorKey.id)
                : undefined;
            let messages;
            if (dictionary && mode === "before" && (!cursorKey || cursorValue)) {
                if (cursorValue) {
                    const msgIdx = dictionary.messages.findIndex((m) => m.key.id === (cursorKey === null || cursorKey === void 0 ? void 0 : cursorKey.id));
                    messages = dictionary.messages.slice(0, msgIdx);
                }
                else
                    messages = dictionary.messages;
                const diff = count - messages.length;
                diff < 0 && (messages = messages.slice(-count));
            }
            else {
                messages = [];
            }
            return messages;
        });
        this.loadMessage = (jid, id) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            return (_e = (yield this.repos.messageDics.findOne({
                where: {
                    jid,
                    DBAuth: { id: this.auth.id },
                },
                relations: ["messages"],
            }))) === null || _e === void 0 ? void 0 : _e.messages.find((x) => x.msgId === id);
        });
        this.mostRecentMessage = (jid) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            return (_f = (yield this.repos.messageDics.findOne({
                where: {
                    jid,
                    DBAuth: { id: this.auth.id },
                },
                relations: ["messages"],
            }))) === null || _f === void 0 ? void 0 : _f.messages.slice(-1)[0];
        });
        this.fetchImageUrl = (jid, sock) => __awaiter(this, void 0, void 0, function* () {
            const contact = yield this.repos.contacts.findOne({ where: { id: jid } });
            if (!contact)
                return sock === null || sock === void 0 ? void 0 : sock.profilePictureUrl(jid);
            if (typeof contact.imgUrl === "undefined")
                yield this.repos.contacts.save(Object.assign(Object.assign({}, contact), { imgUrl: yield (sock === null || sock === void 0 ? void 0 : sock.profilePictureUrl(jid)) }));
            return contact.imgUrl;
        });
        this.fetchGroupMetadata = (jid, sock) => __awaiter(this, void 0, void 0, function* () {
            var group = yield this.repos.groups.findOneBy({
                id: jid,
                DBAuth: { id: this.auth.id },
            });
            if (!group) {
                const metadata = yield (sock === null || sock === void 0 ? void 0 : sock.groupMetadata(jid));
                metadata &&
                    (group = yield this.repos.groups.save(Object.assign(Object.assign({}, metadata), { DBAuth: { id: this.auth.id } })));
            }
            return group;
        });
        this.fetchMessageReceipts = ({ remoteJid, id, }) => __awaiter(this, void 0, void 0, function* () {
            const dictionary = yield this.repos.messageDics.findOne({
                where: {
                    jid: remoteJid,
                    DBAuth: { id: this.auth.id },
                },
                relations: ["messages"],
            });
            const msg = dictionary.messages.find((x) => x.msgId === id);
            return msg === null || msg === void 0 ? void 0 : msg.userReceipt;
        });
        this.options = Object.assign({ disableDelete: [] }, (this.options || {}));
    }
}
exports.default = StoreHandle;
//# sourceMappingURL=StoreHandle.js.map