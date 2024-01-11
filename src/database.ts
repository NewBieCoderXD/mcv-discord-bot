import {MongoClient} from "mongodb"
import * as dotenv from "dotenv"
import { data } from "cheerio/lib/api/attributes"
dotenv.config({
    path:"./.env"
})
const client = new MongoClient(process.env["MONGO_SECRET"]!)
const database = client.db("mcv-discord")
const courses = database.collection<Course>("courses")
const assignments = database.collection<Assignment>("assignments")

export const collecName={
    courses:"courses",
    assignments:"assignments",
    notificationChannels: "notificationChannels"
}

export async function exists(table:string,object:any,checkingKey:string): Promise<boolean> {
    let searchObject: any={};
    searchObject[checkingKey]=object[checkingKey];
    let found = await database.collection(table).findOne(searchObject)
    return found!=null;
}

export async function insertInto(table:string,object:any){
    let result = await database.collection(table).insertOne(object);
}

export async function getCoursesList(){
    return await courses.find({});
}

export async function remove(table:string){
    await database.collection(table).deleteMany({});
}

export interface Course{
    mcvID: number,
    courseID: string,
    title: string,
    year: number,
    semester: number
}

export interface Assignment{
    mcvCourseID: number,
    assignmentName: string
}