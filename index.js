const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const mineflayer = require('mineflayer')
const cmd = require('mineflayer-cmd').plugin
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
        const kanalguncelleme = await message.reply("Kanallar güncelleniyor lütfen bekleyiniz...")
        await updateChannel()
        kanalguncelleme.edit("Kanallar başarıyla güncellendi")
    }

    if(message.content === `${config.prefix}durum`){
        const istatistikmsg = await message.channel.send("İstatistikler toplanıyor lütfen bekleyin...")

      
        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`Görünüşe göre sunucunuza erişilemiyor... Lütfen çevrimiçi olduğunu ve erişimi engellemediğini onaylayın.`)
      
        const body = await res.json()

       // const attachment = new Discord.MessageAttachment(Buffer.from(body.favicon.substr('data:image/png;base64,'.length), 'base64'), "icon.png")

        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
         //   .attachFiles(attachment)
            .setThumbnail("attachment://icon.png")
            .addField("Versiyon", body.server.name)
            .addField("Aktif", `${body.players.now} kişi`)
            .addField("Maximum", `${body.players.max} kişi`)
            .addField("Durum", (body.online ? "açık :green_circle: " : "kapalı :red_circle: "))
            .setColor("#FF0000")
           
        
        istatistikmsg.edit(`:chart_with_upwards_trend: İşte **${config.ipAddress}** istatistikleri:`, { embed })
    }

})
var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = [ 'forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 1;
var maxrandom = 3; 
var bot = mineflayer.createBot({
  host: config.botip,
  username: config.name
});
function getRandomArbitrary(min, max) {
       return Math.random() * (max - min) + min;

}

bot.loadPlugin(cmd)



bot.on('login',function(){
	console.log("Logged In")
	bot.chat(`/login ${config.sifre}`)
	bot.chat("SiwaryNW");
    
});

bot.on('time', function(time) {
	if(config.oto-gece-gunduz == "true"){
	if(bot.time.timeOfDay >= 13000){
	bot.chat('/time set day')
        bot.chat('otomatik gündüz yaptım!')
	}}
    if (connected <1) {
        return;
    }
    if (lasttime<0) {
        lasttime = bot.time.age;
    } else {
        var randomadd = Math.random() * maxrandom * 20;
        var interval = moveinterval*20 + randomadd;
        if (bot.time.age - lasttime > interval) {
            if (moving == 1) {
                bot.setControlState(lastaction,false);
                moving = 0;
                lasttime = bot.time.age;
            } else {
                var yaw = Math.random()*pi - (0.5*pi);
                var pitch = Math.random()*pi - (0.5*pi);
                bot.look(yaw,pitch,false);
                lastaction = actions[Math.floor(Math.random() * actions.length)];
                bot.setControlState(lastaction,true);
                moving = 1;
                lasttime = bot.time.age;
                bot.activateItem();
            }
        }
    }
});

bot.on('spawn',function() {
    connected=1;
});

bot.on('death',function() {
    bot.emit("respawn")
});

client.login(config.token)
