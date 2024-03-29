import { ChatInputCommandInteraction, CacheType, Channel } from "discord.js";
import * as db from "../database/database"
export default {
    name: "unsetnotification",
    description: "Unset this channel for MyCourseVille notification",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>,calledChannel:db.Channel)=>{
        try{
            await db.unsetChannelOfGuild(calledChannel.guildID);
            await interaction.editReply("Successfully stop notification in this channel")
            return;
        }
        catch{
            await interaction.editReply("An error occurred, are you sure this server has notification channel?")
            return;
        }
    }
}