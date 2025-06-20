// server.js
const express = require("express");
const { spawn } = require("child_process");
const app = express();
const cors = require("cors");
const { Cam } = require("onvif");

app.use(cors());

const cameraMap = {
    "192.168.100.56": "rtsp://admin:G@nd66v@N@192.168.100.23:554/cam/realmonitor?channel=1&subtype=0",
    "192.168.100.57": "rtsp://admin:G@nd66v@N@  /feed",
    "192.168.100.58": "rtsp://admin:G@nd66v@N@192.168.100.22/feed",
    "192.168.100.59": "rtsp://admin:G@nd66v@N@192.168.100.20/feed"
};

const ptzCameras = {
    "192.168.100.56": { ip: "192.168.100.20", username: "admin", password: "G@nd66v@N" },
};

app.get("/camera/:id", (req, res) => {
    console.log("Api called")
    const cameraId = req.params.id;
    const cameraURL = cameraMap[cameraId];

    if (!cameraURL) {
        return res.status(404).send("Camera not found");
    }

    // Set proper headers for MJPEG stream
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Pragma': 'no-cache',
        'Connection': 'close'
    });

    const ffmpeg = spawn("ffmpeg", [
        "-i", cameraURL,
        "-f", "mjpeg",
        "-q:v", "5",
        "-r", "50", // Reduced frame rate for better performance
        "-vf", "scale=640:480", // Scale down for better performance
        "-"
    ]);

    let buffer = Buffer.alloc(0);

    ffmpeg.stdout.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        // Look for JPEG boundaries (FFD8 = start, FFD9 = end)
        let startIndex = 0;
        while (true) {
            const jpegStart = buffer.indexOf(Buffer.from([0xFF, 0xD8]), startIndex);
            if (jpegStart === -1) break;

            const jpegEnd = buffer.indexOf(Buffer.from([0xFF, 0xD9]), jpegStart + 2);
            if (jpegEnd === -1) break;

            // Extract complete JPEG frame
            const frame = buffer.slice(jpegStart, jpegEnd + 2);

            // Write multipart boundary and frame
            res.write(`--myboundary\r\n`);
            res.write(`Content-Type: image/jpeg\r\n`);
            res.write(`Content-Length: ${frame.length}\r\n\r\n`);
            res.write(frame);
            res.write(`\r\n`);

            startIndex = jpegEnd + 2;
        }

        // Keep remaining data for next chunk
        if (startIndex > 0) {
            buffer = buffer.slice(startIndex);
        }
    });

    ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        res.end();
    });

    ffmpeg.on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).end();
    });

    req.on("close", () => {
        console.log("Client disconnected");
        ffmpeg.kill("SIGTERM");
    });

    req.on("aborted", () => {
        console.log("Request aborted");
        ffmpeg.kill("SIGTERM");
    });
});

app.post("/camera/:id/ptz", express.json(), (req, res) => {
    const { x, y, zoom } = req.body;
    const { id } = req.params;
    const camConfig = ptzCameras[id];

    if (!camConfig) return res.status(404).send("Camera not found");

    new Cam({
        hostname: "192.168.100.23",
        username: "admin",
        password: "G@nd66v@N",
    }, function (err) {
        if (err) {
            console.error('Camera connection error:', err);
            return res.status(500).send("Camera connection error");
        }

        this.continuousMove({ x, y, zoom }, (err) => {
            if (!err) {
                setTimeout(() => {
                    this.stop({ panTilt: true, zoom: true });
                }, 500);
            }
            res.send("PTZ command sent");
        });
    });
});

app.listen(5000, () => {
    console.log("Streaming server on port 5000");
});