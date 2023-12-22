import Peer, { type DataConnection } from 'peerjs'
import { v4 as uuidv4 } from 'uuid'

const SERVER_URI = import.meta.env.VITE_P2P_SERVER_URI
const SERVER_KEY = import.meta.env.VITE_P2P_SERVER_KEY
const SERVER_CONNECTION = {
    host: SERVER_URI,
    port: 443,
    ping: 1000 * 15, // 15s ping
    secure: true,
    debug: 2, // 2 for normal operation, 3 for debug
    key: SERVER_KEY,
}
class PeerManager {
    private static instance: PeerManager
    public peer: Peer | null = null
    private connections: Record<string, DataConnection> = {}

    private constructor() {}

    public static getInstance(): PeerManager {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!PeerManager.instance) {
            PeerManager.instance = new PeerManager()
        }
        return PeerManager.instance
    }

    public async createPeer(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            if (this.peer == null) {
                const id = uuidv4()
                this.peer = new Peer(id, SERVER_CONNECTION)
                this.setupConnectionListeners(resolve, reject)
            } else {
                console.log('Reusing existing Peer: ', this.peer.id)
                resolve()
            }
        })
    }

    public async connectToPeer(peerId: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            if (this.peer == null) {
                console.error('Peer is not initialized')
                reject(new Error('Peer is not initialized'))
                return
            }

            const conn = this.peer.connect(peerId)
            conn.on('open', () => {
                console.log('Connection established with: ', peerId)
                this.connections[peerId] = conn
                resolve()
            })
            conn.on('error', (err) => {
                console.error('Connection error:', err)
                reject(err)
            })
            conn.on('close', () => {
                console.log('Connection closed')
            })
            conn.on('iceStateChanged', () => {
                console.log('Ice State Changed')
            })
        })
    }

    public async sendToPeer(peerId: string, message: any): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const connection = this.connections[peerId]
            if (connection != null) {
                resolve(connection.send(message))
            } else {
                console.error('No connection found for the given peerId')
                reject(new Error('No connection found for the given peerId'))
            }
        })
    }

    public async destroyPeer(): Promise<void> {
        await new Promise<void>((resolve) => {
            if (this.peer != null) {
                this.peer.destroy()
                this.peer = null
            }
            this.connections = {}
            resolve()
        })
    }

    setupConnectionListeners(
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void,
    ): void {
        if (this.peer == null) {
            console.error('Peer is not initialized')
            return
        }

        this.peer.on('open', () => {
            console.log('Created Peer: ', this.peer?.id)
            if (this.peer != null) {
                resolve()
            } else {
                reject(new Error('Peer is null after creation'))
            }
        })

        this.peer.on('connection', (conn) => {
            console.log(`Incoming connection from: ${conn.connectionId}`)

            conn.on('open', () => {
                console.log('Connection established')
            })

            conn.on('data', (data) => {
                console.log('Received data:', data)
            })

            conn.on('error', (err) => {
                console.error('Connection error:', err)
            })
        })

        this.peer.on('error', (err) => {
            console.error('Peer error:', err)
            reject(err)
        })
    }
}

export default PeerManager
