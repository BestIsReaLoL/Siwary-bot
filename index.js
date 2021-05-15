const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('./config.json')


const updateChannel = async () => {

   
    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `【🛡】Durum: Kapalı`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }
  
    const body = await res.json()

   
    const players = body.players.now

   
    const status = (body.online ? "Aktif" : "Kapalı")

    
    const playersChannelName = `【👥】Oyuncular: ${players}`
    const statusChannelName = `【🛡】Durum: ${status}`

    
    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`${client.user.tag} olarak giriş yaptım (BestIsReaLoL#2431)`)
    setInterval(() => {
        updateChannel()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if(message.content === `${config.prefix}güncelle`){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('Bu komutu sunucu moderatörleri kullanabilir')
        }
        const sentMessage = await message.reply("Kanallar güncelleniyor lütfen bekleyiniz...")
        await updateChannel()
        sentMessage.edit("Kanallar başarıyla güncellendi")
    }

    if(message.content === `${config.prefix}durum`){
        const sentMessage = await message.channel.send("İstatistikler toplanıyor lütfen bekleyi...")

      
        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`Görünüşe göre sunucunuza erişilemiyor... Lütfen çevrimiçi olduğunu ve erişimi engellemediğini onaylayın.`)
      
        const body = await res.json()

        const attachment = new Discord.MessageAttachment(Buffer.from(body.favicon.substr('data:image/png;base64,'.length), 'base64'), "icon.png")

        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            .attachFiles(attachment)
            .setThumbnail("attachment://icon.png")
            .addField("Versiyon", body.server.name)
            .addField("Aktif", `${body.players.now} kişi`)
            .addField("Maximum", `${body.players.max} kişi`)
            .addField("Durum", (body.online ? "açık :green_circle: " : "kapalı :red_circle: "))
            .setColor("#FF0000")
           
        
        sentMessage.edit(`:chart_with_upwards_trend: İşte **${config.ipAddress}** istatistikleri:`, { embed })
    }

})

client.login(config.token)
