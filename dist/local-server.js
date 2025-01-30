"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringFromServer = exports.PORT = void 0;
const http_1 = require("http");
exports.PORT = 4000;
function getStringFromServer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const server = new http_1.Server();
            server.on('connection', (stream) => {
                stream.on('data', (data) => {
                    const response = createResponseString('Login complete. You can close this page and return to the terminal.');
                    stream.write(response, () => {
                        stream.destroy();
                        server.close();
                        resolve(data.toString());
                    });
                });
            });
            server.listen({ port: 4000, host: 'localhost' });
        });
    });
}
exports.getStringFromServer = getStringFromServer;
function createResponseString(message) {
    return `
HTTP/1.1 200 OK

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Success</title>
    <style>
        p {
            font-family: sans-serif;
        }
        body {
            margin: 25px;
        }
    </style>
</head>
<body>
    <p>${message}</p>
</body>
</html>
    `;
}
