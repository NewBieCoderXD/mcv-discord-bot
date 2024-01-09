import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})

!async function start(){
    let result = await fetch("https://www.mycourseville.com/?q=courseville/course/37700/assignment",{
        headers:{
            Cookie:process.env["COOKIE"]
        }
    }).then((res)=>res.text())
    const $ = cheerio.load(result);
    console.log($("#cv-assignment-table tr"))
}()
