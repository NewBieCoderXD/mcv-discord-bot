import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import * as db from "./database"
import {Client, GatewayIntentBits, Interaction} from "discord.js"
import express, {Request,Response} from "express"
dotenv.config({
    path:"./.env"
})

const targetYear = 2023;
const targetSemester = 2;

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
})

let assignmentsStack: Array<db.Assignment>=[];

async function updateCourses(){
    if(process.env["COOKIE"]==undefined){
        return;
    }
    let response = await fetch(`https://www.mycourseville.com/`,{
        method: "get",
        headers:{
            Cookie:process.env["COOKIE"]
        }
    }).then(res=>res.text());
    const $ = cheerio.load(response);
    $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).each(async (i,ele)=>{
        let course:db.Course={
            year: parseInt($(ele).attr("year")!),
            semester: parseInt($(ele).attr("semester")!),
            courseID: $(ele).attr("course_no")!,
            mcvID: parseInt($(ele).attr("cv_cid")!),
            title: $(ele).attr("title")!,
        }
        let found = await db.exists(db.collecName.courses,course,"mcvID")
        if(!found){
            console.log("inserting... "+course.courseID)
            db.insertInto(db.collecName.courses,course);
        }

    })
}

async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    $(("#cv-assignment-table tbody tr td:nth-child(2) a")).each(async (i,ele)=>{
        let assignment:db.Assignment={
            mcvCourseID:mcvID,
            assignmentName:$(ele).text()
        }
        let found=await db.exists(db.collecName.assignments,assignment,"mcvCourseID");
        if(!found){
            assignmentsStack.push(assignment);
            db.insertInto(db.collecName.assignments,assignment);
        }
    })
}

!async function start(){
    await updateCourses();
    let coursesList = await db.getCoursesList();
    for await (const courses of coursesList){
        updateAssignments(courses.mcvID);
    }

}()

// updateCourses()
// updateAssignments(37700);

// db.exists("courses",{mcvID:37700},"mcvID");

client.on("ready",()=>{
    console.log("logged in")
})

client.on("interactionCreate",async (interaction)=>{
    if(!interaction.isChatInputCommand()){

        return;
    }
    else if(interaction.commandName=="setnotification"){
        try{
            let channel = {
                guildID: interaction.guildId,
                channelID: interaction.channelId,
            }
            let found = await db.exists(db.collecName.notificationChannels,channel,"channelID")
            if(found){
                await interaction.reply(
                    `This has already been set!\nTo disable: /stopnotification`
                )
                return;
            }
            db.insertInto(db.collecName.notificationChannels,channel);
            await interaction.reply("Done!");
        }
        catch(e){
            console.log(e);
            await interaction.reply("Error occured!");
        }
    }
})

client.on("messageCreate",(message)=>{
    console.log(message);
})

client.login(process.env["DISCORD_TOKEN"])