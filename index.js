const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const childProcess = require("child_process");

const TG_API_KEY = ""; //API твоего бота
const YA_API_KEY = ""; // API Yandex Cloud

const bot = new TelegramBot(TG_API_KEY, { polling: true });

const execProcess = (command) => {
  childProcess.exec(command, function (error, stdout, stderr) {
    console.log(`stdout: ${stdout}`);
  });
};

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
        if (response.data.result === "Выключи компьютер") {
          execProcess("shutdown -s");
          bot.sendMessage(chatId, "Комп будет выключен");
        } else if (response.data.result === "Перезагрузи компьютер") {
          execProcess("shutdown -r");
          bot.sendMessage(chatId, "Комп будет перезагружен");
        } else if (response.data.result === "Отменить перезагрузку") {
          execProcess("shutdown -a");
          bot.sendMessage(chatId, "Перезагрузка отменяется");
        } else if (response.data.result === "Привет") {
          bot.sendMessage(chatId, "Здравствуй");
        }
      })
      .catch((err) => console.log("Ошибка при распозновании речи", err));
  });
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === "Выключи компьютер") {
        execProcess("shutdown -s");
        bot.sendMessage(chatId, "Комп будет выключен");
    } else if (msg.text === "Перезагрузи компьютер") {
        execProcess("shutdown -r");
        bot.sendMessage(chatId, "Комп будет перезагружен");
    } else if (msg.text === "Отменить перезагрузку") {
        execProcess("shutdown -a");
        bot.sendMessage(chatId, "Перезагрузка отменяется");
    }
});
