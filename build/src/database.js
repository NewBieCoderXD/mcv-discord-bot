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
exports.insertInto = exports.exists = void 0;
const sql_1 = __importDefault(require("./sql"));
function exists(table, object, checkingKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let found = yield (0, sql_1.default) `
        SElECT EXISTS(SELECT 1 FROM ${(0, sql_1.default)(table)} WHERE ${(0, sql_1.default)(checkingKey)} = ${object[checkingKey]})
    `;
        return found[0].exists;
    });
}
exports.exists = exists;
function insertInto(table, object) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, sql_1.default) `
        INSERT INTO ${(0, sql_1.default)(table)} ${(0, sql_1.default)(object)}
    `;
    });
}
exports.insertInto = insertInto;
