const { Command } = require("klasa");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "revoke",
            enabled: true,
            runIn: ["text"],
            description: "Delete your user data in Margarine's systems.",
            extendedHelp: "By deleting your data, you will not be able to create another profile for another 24 hours since deletion. The data is not recoverable."
        });
    }

    async run(msg) {
        var data = this.client.dataManager("select", msg.author.id, "users"); 
        if (!data) { return msg.channel.send(this.client.speech(msg, ["func-dataCheck", "noAccount"])); }

        let filterArr = ["yes", "no"];
        let filter = m => filterArr.includes(m.content.toLowerCase()) && m.author === msg.author;

        await msg.channel.send(this.client.speech(msg, ["revoke", "prompt"])).then(() => {
            msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] }).then((answer) => {
                answer = answer.first().content.toLowerCase();
                if (answer === "no") { return msg.channel.send(this.client.speech(msg, ["revoke", "stopped"])); }
    
                this.client.settings.usedDaily.set(msg.author.id, Date.now()); //Start cooldown timer.
                this.client.dataManager("delete", msg.author.id); //Purge data in the database
                msg.channel.send(this.client.speech(msg, ["revoke", "success"])); //Respond with success
            }).catch((collected) => { msg.channel.send(this.client.speech(msg, ["revoke", "timeout"])); });
        });
    }
};