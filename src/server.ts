import * as cheerio from "cheerio"
import sql from "./sql"
import * as dotenv from "dotenv"
import * as db from "./database"
dotenv.config({
    path:"./.env"
})

const targetYear = 2023;
const targetSemester = 2;
interface Course{
    year:string,
    semester:string,
    courseID:string,
    mcvID:string,
    title:string,
}

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
        let course:Course={
            year: $(ele).attr("year")!,
            semester: $(ele).attr("semester")!,
            courseID: $(ele).attr("course_no")!,
            mcvID: $(ele).attr("cv_cid")!,
            title: $(ele).attr("title")!,
        }
        let found = await db.exists("courses",course,"mcvID")
        if(!found){
            console.log("not exist")
            let result = await sql`
                INSERT INTO courses ${sql(course)}
            `
            console.log(result);
        }

    })
}

async function loadMore(){
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
}

async function updateAssignments(mcvID:string){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    // $(("#cv-assignment-table tbody tr td:nth-child(2) a")).each((i,ele)=>{
        
    //     if()
    // })
}

!async function start(){
    // let result = await sql`
    //     SELECT * FROM assignments
    // `
    // console.log(result)

    // if(process.env["COOKIE"]==undefined){
    //     return;
    // }
    // let courseId="37700";
    // let result = await fetch(`https://www.mycourseville.com/?q=courseville/course/${courseId}/assignment`,{
    //     method: "get",
    //     headers:{
    //         Cookie:process.env["COOKIE"]
    //     }
    // }).then((res)=>res.text())
    // const $ = cheerio.load(result);
    // console.log($(("#cv-assignment-table tbody tr td:nth-child(2) a")).map((i:number,ele:cheerio.Element)=>{
    //     return $(ele).html();
    // }).get());
}()

updateCourses()
// updateAssignments("37700")