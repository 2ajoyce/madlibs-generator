import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";

const SERVER_URI = "madlibs-server-xxnwdd2lpq-uc.a.run.app";
const SERVER_KEY = "d41d8cd98f00b204e9800998ecf8427e";
const SERVER_CONNECTION = {
  host: SERVER_URI,
  port: 443,
  ping: 1000 * 15, // 15s ping
  secure: true,
  debug: 2,
  key: SERVER_KEY,
};

class PeerManager {
  private static instance: PeerManager;
  public peer: Peer | null = null;

  private constructor() {}

  public static getInstance(): PeerManager {
    if (!PeerManager.instance) {
      PeerManager.instance = new PeerManager();
    }
    return PeerManager.instance;
  }

  public createPeer(sessionId?: string): string {
    if (this.peer) return this.peer.id;

    const id = uuidv4();
    this.peer = new Peer(id, SERVER_CONNECTION);
    console.log(`Created Peer with id ${this.peer.id}`);

    this.peer.on("error", (err) => console.error("Peer error:", err));
    this.peer.on("connection", (conn) => {
      console.log(`Incoming connection with ${conn.connectionId}`);
      conn.on("open", () => console.log("Connection established"));
      conn.on("data", (data) => console.log("Received data:", data));
      conn.on("error", (err) => console.error("Connection error:", err));
    });
    if (sessionId) {
      try {
        console.log(`Connecting to Peer ${sessionId}`);
        const conn = this.peer.connect(sessionId);
        console.log(conn);
        conn.on("open", () => {
          console.log("Connection Established!");
          conn.on("data", function (data) {
            console.log("Received", data);
          });
          conn.send("Hello!");
        });
        conn.on("error", (err) => console.log("Connection error:", err));
        conn.on("close", () => console.log("Connection closed"));
        conn.on("iceStateChanged", () => console.log("Ice State Changed"));
      } catch (err) {
        console.log("Connect failed with error: ", err);
      }
    }
    return this.peer.id;
  }

  public destroyPeer(): void {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export default PeerManager;
