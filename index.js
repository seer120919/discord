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
  // 봇이 쓴 메시지이거나 설정한 프리픽스(!)로 시작하지 않으면 무시
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const amount = parseInt(args[0]);

  // 계산 명령어 사용 시 숫자를 입력하지 않았을 경우 안내
  if (isNaN(amount) && ['로벅스', '가격', '수수료'].includes(command)) {
    return message.reply('올바른 숫자를 입력해 주세요!\n예시: `!로벅스 10000`, `!가격 1000`, `!수수료 1000`');
  }

  // 1. 원화 -> 로벅스 계산기 (!로벅스 [원화금액])
  if (command === '로벅스') {
    const robux = Math.floor(amount / config.robux_per_krw);
    const embed = new EmbedBuilder()
      .setTitle('💰 로벅스 계산 결과')
      .setColor('#3498db')
      .addFields(
        { name: '입력 금액', value: `${amount.toLocaleString()} 원`, inline: true },
        { name: '받을 수 있는 로벅스', value: `**${robux.toLocaleString()} Robux**`, inline: true }
      )
      .setFooter({ text: `현재 적용 환율: 1 Robux = ${config.robux_per_krw}원` });

    return message.channel.send({ embeds: [embed] });
  }

  // 2. 로벅스 -> 원화 계산기 (!가격 [로벅스수량])
  if (command === '가격') {
    const krw = Math.floor(amount * config.robux_per_krw);
    const embed = new EmbedBuilder()
      .setTitle('💵 원화 가격 계산 결과')
      .setColor('#2ecc71')
      .addFields(
        { name: '입력 로벅스', value: `${amount.toLocaleString()} Robux`, inline: true },
        { name: '입금 필요 금액', value: `**${krw.toLocaleString()} 원**`, inline: true }
      )
      .setFooter({ text: `현재 적용 환율: 1 Robux = ${config.robux_per_krw}원` });

    return message.channel.send({ embeds: [embed] });
  }

  // 3. 로블록스 수수료 30% 계산기 (!수수료 [목표로벅스])
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

// Railway 환경 변수(BOT_TOKEN)를 먼저 찾고, 없으면 config.json을 참고합니다.
client.login(process.env.BOT_TOKEN || config.token);
