module.exports = HomeController;
const fs = require("fs");
const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient();
const player = require("play-sound")({})

function HomeController($config, $event, $logger) {
    this.welcome = function (io) {
        io.json({
            name: $config.get("package.name"),
            version: $config.get("package.version"),
            port: $config.get("app.port"),
            debug: $config.get("app.debug"),
            log: $config.get("log.storage"),
            autoload: $config.get("app.autoload"),
        });
    };

    this.speech = async function (io) {
        await textToSpeech(io.inputs.text);
        io.json({
            status: "succesful"
        });
    }

    /**
     * Text to speech
     * @param {string} text 
     * @param {string} languageCode default vi-VN
     * @param {string} gender default NATURAL
     */
    async function textToSpeech(text, languageCode, gender) {
        var self = this;
        const request = {
            input: { ssml: "<speak>" + text + "</speak>" },
            // Select the language and SSML Voice Gender (optional)
            voice: {
                "languageCode": languageCode == null ? "vi-VN" : languageCode,
                "ssmlGender": gender == null ? ["MALE", "FEMALE"][parseInt(Math.random() * 2)] : gender
            },
            // Select the type of audio encoding
            audioConfig: {
                volumeGainDb: 9.0, //A value of +6.0 (dB) will play at approximately twice the amplitude of the normal native signal amplitude
                speakingRate: 0.85,
                // pitch: 0,
                audioEncoding: "MP3"
            },
        };
        // Performs the Text-to-Speech request
        return new Promise((resolve, reject) => {
            client.synthesizeSpeech(request, (err, response) => {
                if (err) {
                    console.error("ERROR:", err);
                    return;
                }
                // Write the binary audio content to a local file
                let audioPath = "storage/tts_" + (new Date()).getTime() + ".mp3";
                fs.writeFile(audioPath, response.audioContent, "binary", async err => {
                    if (err) {
                        console.error("ERROR:", err);
                        reject(err);
                        return;
                    }
                    await playMp3(audioPath);
                    resolve(audioPath);
                });
            });
        });
    }

    /**
     * Play a mp3 file
     * @param {String} filePath 
     */
    async function playMp3(filePath) {
        return new Promise((resolve, reject) => {
            player.play(filePath, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}