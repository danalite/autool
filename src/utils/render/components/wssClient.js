

export const wssClientCb = (callback = () => { }) => {
    return new Promise(function (resolve, reject) {
        var server = new WebSocket("ws://localhost:5678");
        server.onopen = function () {
            // Instantiate the connection
            server.send(
                JSON.stringify({
                    event: EventType.I_EVENT_WSS_REQ,
                    value: "__MAIN__",
                })
            );
            console.log("Connected to backend server.");
        };
        server.onerror = function (err) {
            reject(err);
        };
        server.onmessage = function (e) {
            // Process the message from WSS server
            const resp = callback(JSON.parse(e.data));
            if (resp == "__DONE__") {
                server.close();
            }
        };
        resolve({
            server: server,
        });
    });
}