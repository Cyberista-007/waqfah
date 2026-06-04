const play = require('play-dl');
const https = require('https');
require('dotenv').config();

async function test() {
    try {
        if (process.env.YOUTUBE_COOKIE) {
            console.log("Setting youtube cookie...");
            await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE } });
        }
        
        const videoUrl = 'https://www.youtube.com/watch?v=CWcmyqax95M';
        console.log("Fetching video info...");
        const videoInfo = await play.video_info(videoUrl);
        const format18 = videoInfo.format.find(f => f.itag === 18);
        if (!format18 || !format18.url) {
            console.log("Itag 18 has no URL!");
            return;
        }
        
        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36";
        console.log("Using User-Agent:", userAgent);
        
        const urlObj = new URL(format18.url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: {
                'User-Agent': userAgent,
                'Accept': '*/*',
                'Accept-Encoding': 'identity',
                'Connection': 'keep-alive',
                'Host': urlObj.hostname
            }
        };

        https.get(options, (res) => {
            console.log("Status code:", res.statusCode);
            console.log("Headers:", res.headers);
            res.destroy();
        }).on('error', (e) => {
            console.error("HTTP request error:", e);
        });
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
