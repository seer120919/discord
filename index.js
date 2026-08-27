const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once('ready', () => {
  console.log(`[성공] 디스코드 봇 로그인 완료: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const amount = parseFloat(args[0]);

  // 숫자가 아니거나 올바르지 않은 값 예외 처리
  if ((isNaN(amount) || amount <= 0) && ['로벅스', '가격', '달러', '달러로벅스', '수수료'].includes(command)) {
    return message.reply('올바른 양의 숫자를 입력해 주세요!\n예시: `!로벅스 10000`, `!가격 1000`, `!달러 10`, `!달러로벅스 1000`, `!수수료 1000`');
  }

  // 1. 원화 -> 로벅스 (!로벅스 [원화금액])
  if (command === '로벅스') {
    const robux = Math.floor(amount / config.robux_per_krw);
    const embed = new EmbedBuilder()
      .setTitle('💰 원화 ➔ 로벅스 계산 결과')
      .setColor('#3498db')
      .addFields(
        { name: '입력 금액', value: `${amount.toLocaleString()} 원`, inline: true },
        { name: '받을 수 있는 로벅스', value: `**${robux.toLocaleString()} Robux**`, inline: true }
      )
      .setFooter({ text: `기준 환율: 1 Robux = ${config.robux_per_krw}원` });

    return message.channel.send({ embeds: [embed] });
  }

  // 2. 로벅스 -> 원화 (!가격 [로벅스수량])
  if (command === '가격') {
    const krw = Math.floor(amount * config.robux_per_krw);
    const embed = new EmbedBuilder()
      .setTitle('💵 로벅스 ➔ 원화 가격 계산 결과')
      .setColor('#2ecc71')
      .addFields(
        { name: '입력 로벅스', value: `${amount.toLocaleString()} Robux`, inline: true },
        { name: '입금 필요 금액', value: `**${krw.toLocaleString()} 원**`, inline: true }
      )
      .setFooter({ text: `기준 환율: 1 Robux = ${config.robux_per_krw}원` });

    return message.channel.send({ embeds: [embed] });
  }

  // 3. 달러 -> 로벅스 (!달러 [달러금액])
  if (command === '달러') {
    const robux = Math.floor(amount / config.robux_per_usd);
    const embed = new EmbedBuilder()
      .setTitle('💵 달러($) ➔ 로벅스 계산 결과')
      .setColor('#f1c40f')
      .addFields(
        { name: '입력 달러', value: `$${amount.toLocaleString()}`, inline: true },
        { name: '받을 수 있는 로벅스', value: `**${robux.toLocaleString()} Robux**`, inline: true }
      )
      .setFooter({ text: `기준 환율: 1 Robux = $${config.robux_per_usd}` });

    return message.channel.send({ embeds: [embed] });
  }

  // 4. 로벅스 -> 달러 (!달러로벅스 [로벅스수량])
  if (command === '달러로벅스') {
    const usd = (amount * config.robux_per_usd).toFixed(2);
    const embed = new EmbedBuilder()
      .setTitle('💰 로벅스 ➔ 달러($) 가격 계산 결과')
      .setColor('#9b59b6')
      .addFields(
        { name: '입력 로벅스', value: `${amount.toLocaleString()} Robux`, inline: true },
        { name: '입금 필요 달러', value: `**$${parseFloat(usd).toLocaleString()}**`, inline: true }
      )
      .setFooter({ text: `기준 환율: 1 Robux = $${config.robux_per_usd}` });

    return message.channel.send({ embeds: [embed] });
  }

  // 5. 로블록스 수수료 30% 계산기 (!수수료 [목표로벅스])
  if (command === '수수료') {
    const listingPrice = Math.floor(amount / 0.7);
    const embed = new EmbedBuilder()
      .setTitle('⚙️ 로블록스 30% 수수료 계산기')
      .setColor('#e74c3c')
      .addFields(
        { name: '실제 수령할 로벅스', value: `${amount.toLocaleString()} Robux`, inline: true },
        { name: '게임패스 올릴 가격', value: `**${listingPrice.toLocaleString()} Robux**`, inline: true },
        { name: '참고 사항', value: '올린 가격의 70%만 수령됩니다 (수수료 30% 차감).' }
      );

    return message.channel.send({ embeds: [embed] });
  }
});

// Railway Variables에 저장하신 discord_bot 이름으로 토큰을 불러옵니다.
client.login(process.env.discord_bot || config.token);
