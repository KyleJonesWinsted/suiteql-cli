import { Server } from "http";

export const PORT = 4000;

export async function getStringFromServer(): Promise<string> {
    return new Promise((resolve) => {
        const server = new Server();
        server.on('connection', (stream) => {
            stream.on('data', (data) => {
                const response = createResponseString('Login complete. You can close this page and return to the terminal.')
                stream.write(response, () => {
                    stream.destroy();
                    server.close();
                    resolve(data.toString());
                });
            });
        });
        server.listen({ port: 4000, host: 'localhost' });
    })
}

function createResponseString(message: string): string {

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