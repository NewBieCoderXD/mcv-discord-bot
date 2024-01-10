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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const dotenv = __importStar(require("dotenv"));
const db = __importStar(require("./database"));
const express_1 = __importDefault(require("express"));
dotenv.config({
    path: "./.env"
});
const targetYear = 2023;
const targetSemester = 2;
const app = (0, express_1.default)();
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
            let found = yield db.exists("courses", course, "mcvID");
            if (!found) {
                db.insertInto("courses", course);
                // let result = await sql`
                //     INSERT INTO courses ${sql(course)}
                // `
            }
        }));
    });
}
function loadMore() {
    return __awaiter(this, void 0, void 0, function* () {
        // let requestJSON: any = {
        //     "cv_cid": mcvID,
        //     next: "1"
        // }
        // let formData = new FormData();
        // Object.keys(requestJSON).forEach((key:string)=>{
        //     formData.append(key,requestJSON[key].toString())
        // })
        // console.log(formData);
        // let response = await fetch("https://www.mycourseville.com/?q=courseville/ajax/loadmoreassignmentrows",{
        //     method: "POST",
        //     headers:{
        //         Cookie: process.env["COOKIE"]!
        //     },
        //     body: formData
        // }).then(res=>res.text());
        // console.log(response);
        // const $ = cheerio.load(response);
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
            let found = yield db.exists("assignments", assignment, "mcvCourseID");
            if (!found) {
                assignmentsStack.push(assignment);
                db.insertInto("assignments", assignment);
            }
        }));
    });
}
app.get("/", (req, res) => {
    res.send("gg");
});
// !async function start(){
// }()
// updateCourses()
// updateAssignments(37700);
console.log("gg");
app.listen(8080);
