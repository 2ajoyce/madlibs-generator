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

    private constructor () {}

    public static getInstance (): PeerManager {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!PeerManager.instance) {
            PeerManager.instance = new PeerManager()
        }
        return PeerManager.instance
    }

    public createPeer (callback?: (peerId: string) => void): void {
        if (this.peer == null) {
            const id = uuidv4()
            this.peer = new Peer(id, SERVER_CONNECTION)

            this.peer.on('open', () => {
                console.log('Created Peer: ', this.peer?.id)
                if (callback != null && this.peer != null) {
                    callback(this.peer.id)
                }
            })

            this.peer.on('error', (err) => {
                console.error('Peer error:', err)
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
        } else {
            console.log('Reusing existing Peer: ', this.peer.id)
            if (callback != null) {
                callback(this.peer.id)
            }
        }
    }

    public connectToPeer (peerId: string, callback?: () => void): void {
        if (this.peer == null) {
            console.error('Peer is not initialized')
            return
        }

        const conn = this.peer.connect(peerId)
        conn.on('open', () => {
            console.log('Connection established with: ', peerId)
            this.connections[peerId] = conn
            if (callback != null) {
                callback()
            }
        })
        conn.on('error', (err) => {
            console.log('Connection error:', err)
        })
        conn.on('close', () => {
            console.log('Connection closed')
        })
        conn.on('iceStateChanged', () => {
            console.log('Ice State Changed')
        })
    }

    public sendToPeer (peerId: string, message: any): void | Promise<void> {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (this.connections[peerId]) {
            return this.connections[peerId].send(message)
        } else {
            console.error('No connection found for the given peerId')
        }
    }

    public destroyPeer (): void {
        if (this.peer != null) {
            this.peer.destroy()
            this.peer = null
        }
        this.connections = {}
    }
}

export default PeerManager
