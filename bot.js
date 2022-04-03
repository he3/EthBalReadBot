const Web3 = require('web3');

//const keys = require('./keys');
//const aws = require('aws-sdk');

// let s3 = new aws.S3({
//     infura: process.env.infura,
//     discord: process.env.discord
// });

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.infura}`));

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
}

client.on('ready', () => {
    const cyopFundContractAddress = "0x857f29dd5903b2119771f6dd856e825e63f421ef"
    client.api.applications(client.user.id).commands.post({
        data: {
            name: 'dao_balance',
            description: 'Get the DAO balance.'
        }
    });
    client.api.applications(client.user.id).commands.post({
        data: {
            name: 'glitch_reward',
            description: 'Get the glitch_reward.'
        }
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const commandId = interaction.data.id;
        const commandName = interaction.data.name;
        
        if (commandName == 'dao_balance') {
            let addresses = interaction.data.options[0].value.split(/[\s,]+/).filter(x => web3.utils.isAddress(x)).filter(onlyUnique);
            addresses.push(cyopFundContractAddress)
            let acm = [];
            while (addresses.length > 0) {
                let address = addresses.pop();
                acm.unshift(`${web3.utils.fromWei(await web3.eth.getBalance(address), 'ether')} ETH`);
            }
            let content = '' + acm.join('\n');
            if (content.length === 0) content = 'no valid addresses provided';
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content
                    }
                }
            });
        }

        if (commandName == 'glitch_reward') {
            let addresses = interaction.data.options[0].value.split(/[\s,]+/).filter(x => web3.utils.isAddress(x)).filter(onlyUnique);
            addresses.push(cyopFundContractAddress)
            let acm = [];
            while (addresses.length > 0) {
                let address = addresses.pop();
                acm.unshift(`${web3.utils.fromWei(await web3.eth.getBalance(address), 'ether')*0.1} ETH`);
            }
            let content = '' + acm.join('\n');
            if (content.length === 0) content = 'no valid addresses provided';
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content
                    }
                }
            });
        }
    });
});

client.login(process.env.discord);