import { REST, Routes } from 'discord.js';
import * as dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
const rest = new REST({version: '10'}).setToken(process.env["DISCORD_TOKEN"]!);
// const commands=[
//     {
//         name: "setNotificationChannel",
//         description: "set this channel for mycourseville notification",
//     }
// ]
const commands=[
    {
        name: "setnotification",
        description: "set this channel for mycourseville notification",
    }
]
rest.put(Routes.applicationCommands(process.env["CLIENT_ID"]!),{body:commands})
