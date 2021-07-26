const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const childProcess = require("child_process");

const TG_API_KEY = ""; //API твоего бота
const YA_API_KEY = ""; // API Yandex Cloud

const bot = new TelegramBot(TG_API_KEY, { polling: true });

const execProcess = (command) => {
  childProcess.exec(command, function (error, stdout, stderr) {
    console.log(stdout: ${stdout});
  });
};

const getFlag = {
  "Выключи компьютер": "-s",
  "Перезагрузи компьютер": "-r",
  "Отменить перезагрузку": "-a"
}
const getMessage = {
  "-s": "Комп будет выключен",
  "-r": "Отменить перезагрузку",
  "-a": "Перезагрузка отменяется"
}

function applyShutdown(chatId, mode) {
  const flag = getFlag[mode];
  if (flag) {
    execProcess("shutdown " + flag);
    bot.sendMessage(chatId, getMessage[flag]);
    return true;
  }
  return false;
}

bot.on("voice", (msg) => {
  const stream = bot.getFileStream(msg.voice.file_id);
  const chatId = msg.chat.id;
  let chunks = [];

  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("end", () => {
    const axiosConfig = {
      method: "POST",
      url: "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize",
      headers: {
        Authorization: "Api-Key" + " " + YA_API_KEY,
      },
      data: Buffer.concat(chunks),
    };
    axios(axiosConfig)
      .then((response) => {
        if (!applyShutdown(chatId, response.data.result) && response.data.result === "Привет") {
          bot.sendMessage(chatId, "Здравствуй");
        }
      })
      .catch((err) => console.log("Ошибка при распозновании речи", err));
  });
});

bot.on("message", (msg) => applyShutdown(msg.chat.id, msg.text));