import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export let io: Server;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  //@ts-ignore
  if (res?.socket?.server?.io) {
    console.log('Socket is already running');
    //@ts-ignore
    io = res.socket.server.io;
  } else {
    console.log('Socket is initializing');
    //@ts-ignore
    io = new Server(res.socket.server);
    //@ts-ignore
    res.socket.server.io = io;

    io.on('connection', socket => {

      socket.on('message', message => {
        console.log('message', message)
        socket.broadcast.emit('message', message)
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false
  }
}
