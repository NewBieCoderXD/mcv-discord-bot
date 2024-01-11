"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const dotenv = __importStar(require("dotenv"));
const db = __importStar(require("./database"));
const discord_js_1 = require("discord.js");
const express_1 = __importDefault(require("express"));
dotenv.config({
    path: "./.env"
});
const targetYear = 2023;
const targetSemester = 2;
const app = (0, express_1.default)();
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages
    ]
});
let assignmentsStack = [];
function updateCourses() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env["COOKIE"] == undefined) {
            return;
        }
        let response = yield fetch(`https://www.mycourseville.com/`, {
            method: "get",
            headers: {
                Cookie: process.env["COOKIE"]
            }
        }).then(res => res.text());
        const $ = cheerio.load(response);
        $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).each((i, ele) => __awaiter(this, void 0, void 0, function* () {
            let course = {
                year: parseInt($(ele).attr("year")),
                semester: parseInt($(ele).attr("semester")),
                courseID: $(ele).attr("course_no"),
                mcvID: parseInt($(ele).attr("cv_cid")),
                title: $(ele).attr("title"),
            };
            let found = yield db.exists(db.collecName.courses, course, "mcvID");
            if (!found) {
                console.log("inserting... " + course.courseID);
                db.insertInto(db.collecName.courses, course);
            }
        }));
    });
}
function updateAssignments(mcvID) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`, {
            method: "GET",
            headers: {
                Cookie: process.env["COOKIE"]
            }
        }).then(res => res.text());
        const $ = cheerio.load(response);
        $(("#cv-assignment-table tbody tr td:nth-child(2) a")).each((i, ele) => __awaiter(this, void 0, void 0, function* () {
            let assignment = {
                mcvCourseID: mcvID,
                assignmentName: $(ele).text()
            };
            let found = yield db.exists(db.collecName.assignments, assignment, "mcvCourseID");
            if (!found) {
                assignmentsStack.push(assignment);
                db.insertInto(db.collecName.assignments, assignment);
            }
        }));
    });
}
!function start() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        yield updateCourses();
        let coursesList = yield db.getCoursesList();
        try {
            for (var _d = true, coursesList_1 = __asyncValues(coursesList), coursesList_1_1; coursesList_1_1 = yield coursesList_1.next(), _a = coursesList_1_1.done, !_a; _d = true) {
                _c = coursesList_1_1.value;
                _d = false;
                const courses = _c;
                updateAssignments(courses.mcvID);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = coursesList_1.return)) yield _b.call(coursesList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}();
// updateCourses()
// updateAssignments(37700);
// db.exists("courses",{mcvID:37700},"mcvID");
client.on("ready", () => {
    console.log("logged in");
});
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand()) {
        return;
    }
    else if (interaction.commandName == "setnotification") {
        try {
            let channel = {
                guildID: interaction.guildId,
                channelID: interaction.channelId,
            };
            let found = yield db.exists(db.collecName.notificationChannels, channel, "channelID");
            if (found) {
                yield interaction.reply(`This has already been set!\nTo disable: /stopnotification`);
                return;
            }
            db.insertInto(db.collecName.notificationChannels, channel);
            yield interaction.reply("Done!");
        }
        catch (e) {
            console.log(e);
            yield interaction.reply("Error occured!");
        }
    }
}));
client.on("messageCreate", (message) => {
    console.log(message);
});
client.login(process.env["DISCORD_TOKEN"]);
