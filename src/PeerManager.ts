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

export enum MadlibsMessageType {
    InputChange = 'INPUT_CHANGE',
    TemplateChange = 'TEMPLATE_CHANGE',
    RequestState = 'REQUEST_STATE',
    InitialState = 'INITIAL_STATE',
}

export interface MadlibsMessage {
    type: MadlibsMessageType
    peerId: string
    data: Record<string, any>
}

function isValidMadlibsMessage(message: any): message is MadlibsMessage {
    if (typeof message !== 'object' || message === null) {
        return false
    }

    if (!('type' in message) || !('data' in message)) {
        return false
    }

    if (!Object.values(MadlibsMessageType).includes(message.type)) {
        return false
    }

    if (message.data === null) {
        return false
    }

    return true
}

// This type exists because Prettier and eslint could not
// agree on formatting when inlined
type DataReceivedCallbacks = Record<
    MadlibsMessageType,
    Array<(data: any) => void | Promise<void>>
>

class PeerManager {
    private static instance: PeerManager
    public peer: Peer | null = null
    private connections: DataConnection[] = []
    private readonly dataReceivedCallbacks: DataReceivedCallbacks

    private constructor() {
        this.dataReceivedCallbacks = {
            INPUT_CHANGE: [],
            TEMPLATE_CHANGE: [],
            REQUEST_STATE: [],
            INITIAL_STATE: [],
        }
    }

    public static getInstance(): PeerManager {
        if (!PeerManager.instance) {
            PeerManager.instance = new PeerManager()
        }
        return PeerManager.instance
    }

    public setDataReceivedCallback(
        types: MadlibsMessageType[],
        callback: (data: any) => void | Promise<void>,
    ): void {
        types.forEach((type) => {
            this.dataReceivedCallbacks[type].push(callback)
        })
    }

    public async createPeer(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            if (this.peer == null) {
                const id = uuidv4()
                this.peer = new Peer(id, SERVER_CONNECTION)
                this.setupPeerListeners(resolve, reject)
            } else {
                console.debug('Reusing existing Peer: ', this.peer.id)
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
                console.debug('Connection established with: ', peerId)
                const pm = PeerManager.getInstance()
                pm.connections.push(conn)
                pm.setupConnectionListeners(conn)
                resolve()
            })
            conn.on('error', (err) => {
                console.error('Connection error:', err)
                reject(err)
            })
        })
    }

    public async sendMessageToAll(message: MadlibsMessage): Promise<void[]> {
        console.debug('Sending message to all', message)
        const sendPromises = Object.values(this.connections).map(
            async (connection) => {
                await new Promise<void>((resolve, reject) => {
                    try {
                        resolve(connection.send(message))
                    } catch (error) {
                        reject(error)
                    }
                })
            },
        )

        return Promise.all(sendPromises)
    }

    public async sendMessage(
        peerId: string,
        message: MadlibsMessage,
    ): Promise<void> {
        console.debug(`Sending message to ${peerId}: `, message)
        await new Promise<void>((resolve, reject) => {
            const pm = PeerManager.getInstance()
            const conn = pm.connections.find((e) => e.peer === peerId)
            if (conn !== undefined) {
                resolve(conn.send(message))
            } else {
                reject(new Error(`No connection to ${peerId} found`))
            }
        })
    }

    public async destroyPeer(): Promise<void> {
        const pm = PeerManager.getInstance()
        await new Promise<void>((resolve) => {
            if (pm.peer != null) {
                pm.peer.destroy()
                pm.peer = null
            }
            pm.connections = []
            resolve()
        })
    }

    setupPeerListeners(
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void,
    ): void {
        if (this.peer == null) {
            console.error('Peer is not initialized')
            return
        }

        this.peer.on('open', () => {
            console.debug('Created Peer: ', this.peer?.id)
            if (this.peer != null) {
                resolve()
            } else {
                reject(new Error('Peer is null after creation'))
            }
        })

        this.peer.on('connection', (conn) => {
            console.debug(`Incoming connection from: ${conn.connectionId}`)
            this.setupConnectionListeners(conn)
        })

        this.peer.on('error', (err) => {
            console.error('Peer error:', err)
            reject(err)
        })
    }

    setupConnectionListeners(conn: DataConnection): void {
        conn.on('open', () => {
            console.debug('Connection established')
            const pm = PeerManager.getInstance()
            pm.connections.push(conn)
        })

        conn.on('data', (data) => {
            if (isValidMadlibsMessage(data)) {
                console.debug(
                    'Message Received: ',
                    data.peerId,
                    data.type,
                    data.data,
                )
                const pm = PeerManager.getInstance()
                for (const cb of pm.dataReceivedCallbacks[data.type]) {
                    void cb(data)
                }
            } else {
                console.error('Invalid message received: ', data)
            }
        })

        conn.on('error', (err) => {
            console.error('Connection error:', err)
        })
    }
}

export default PeerManager
