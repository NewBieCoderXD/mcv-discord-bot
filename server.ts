import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})

!async function start(){
    if(process.env["COOKIE"]==undefined){
        return;
    }
    let result = await fetch("https://www.mycourseville.com/?q=courseville/course/37700/assignment",{
        method: "get",
        headers:{
            Cookie:process.env["COOKIE"]
        }
    }).then((res)=>res.text())
    const $ = cheerio.load(result);
    console.log($(("#cv-assignment-table tbody tr td:nth-child(2) a")).map((i:number,ele:cheerio.Element)=>{
        return $(ele).html();
    }).get());
}()
