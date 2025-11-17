const rooms = {};

export function createRoom(code, socketId) {
    rooms[code] = {
        host: socketId,
        listeners: []
    };
}

export function joinRoom(code, socketId) {
    if (!rooms[code]) return false;

    rooms[code].listeners.push(socketId);
    return true;
}

export function getRoom(code) {
    return rooms[code];
}

export function removeRoom(code) {
    delete rooms[code];
}
