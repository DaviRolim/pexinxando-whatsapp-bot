const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const axios = require('axios')


const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

/**
 * Aqui vem como default 'message', bora trocar para 'message_create', 
 * dessa forma nós também poderemos dar comandos e não apenas seus 
 * contatos.
 */
client.on('message_create', msg => {
    const command = msg.body.split(' ')[0];
    // Cola seu número onde tem o 84848484, sem o 9
    const sender = msg.from.includes("99763846") ? msg.to : msg.from
    if (command === "pexinxa")  findPexinxas(msg, sender)
});

// create a function that calls the following api: http://localhost:5000/api/v1/search?search_term=
// and returns the first result
async function findPexinxas(msg, sender) {
    const command = msg.body.split(' ')[0];
    try {
        const searchItem = msg.body.slice(command.length + 1).replace(' ', '+');
        const response = await axios.get(`http://localhost:5000/api/v1/search?search_term=${searchItem}`)
        console.log('response', response.data)
        const pexinxaFormatted = formatResponse(response.data)
        await msg.reply(pexinxaFormatted)
    } catch (e) {
        console.log('e', e)
        msg.reply('Not able to fetch data!')
    }
}

const formatResponse = (response) => {
    const stats = response.buscape
    let msg = `O preco mais baixo encontrado foi de: \n*R$ ${stats.lowest_price}* em ${stats.lowest_price_date} \n\ne a media de preco foi de:\n*R$ ${stats.avg_price.toFixed(2)}*.\nO preco atual é de R$ *${stats.current_price}*`
    if (response.amazon.length > 0) {
        msg += `\n\nAchei esses preços na Amazon: \n`
        response.amazon.forEach((item, index) => {
            msg += `\n*${index + 1}º* - *${item.title}* \nPreço: *R$ ${item.price}* \n${item.stars} - Comentarios(${item.number_of_reviews})\nLink: ${item.link}`
        })
    }

    return msg
}

client.initialize();