// CHANGE THIS TO YOUR BACKEND URL:
window.SIGNALING_SERVER = "http://172.16.251.71:3000";

window.socket = io(window.SIGNALING_SERVER, {
    transports: ["websocket"]
});
