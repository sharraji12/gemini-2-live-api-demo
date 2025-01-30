/**
 * Core application class that orchestrates the interaction between various components
 * of the Gemini 2 Live API. Manages audio streaming, WebSocket communication,
 * and coordinates the overall application functionality.
 */
import { GeminiWebsocketClient } from '../ws/client.js';

import { AudioRecorder } from '../audio/recorder.js';
import { AudioStreamer } from '../audio/streamer.js';
import { AudioVisualizer } from '../audio/visualizer.js';
import { CameraManager } from '../camera/camera.js';
import { ScreenManager } from '../screen/screen.js';

export class GeminiAgent{
    constructor(name = 'GeminiAgent', url, config, toolManager) {
        this.initialized = false;
        this.connected = false;
        // Initialize components
        this.audioContext = null;
        this.audioRecorder = null;
        this.audioStreamer = null;

        // Screen & Camera settings
        this.fps = localStorage.getItem('fps') || '5';
        this.captureInterval = 1000 / this.fps;
        this.resizeWidth = localStorage.getItem('resizeWidth') || '640';
        this.quality = localStorage.getItem('quality') || '0.4';
        
        // Initialize camera
        this.cameraManager = new CameraManager({
            width: this.resizeWidth,
            quality: this.quality,
            facingMode: localStorage.getItem('facingMode') || 'environment'
        });
        this.cameraInterval = null;

        // Initialize screen sharing
        this.screenManager = new ScreenManager({
            width: this.resizeWidth,
            quality: this.quality,
            onStop: () => {
                // Clean up interval and emit event when screen sharing stops
                if (this.screenInterval) {
                    clearInterval(this.screenInterval);
                    this.screenInterval = null;
                }
                // Emit screen share stopped event
                this.emit('screenshare_stopped');
            }
        });
        this.screenInterval = null;
        
        this.toolManager = toolManager;
        config.tools.functionDeclarations = toolManager.getToolDeclarations();
        this.config = config;

        this.name = name;
        this.url = url;
        this.client = null;
    }

    setupEventListeners() {
        // Handle incoming audio data from the model
        this.client.on('audio', async (data) => {
            try {
                if (!this.audioStreamer.isInitialized) {
                    this.audioStreamer.initialize();
                }
                this.audioStreamer.streamAudio(new Uint8Array(data));
            } catch (error) {
                throw new Error('Audio processing error:' + error);
            }
        });

        // Handle model interruptions by stopping audio playback
        this.client.on('interrupted', () => {
            this.audioStreamer.stop();
            this.audioStreamer.isInitialized = false;
        });

        // Add an event handler when the model finishes speaking if needed
        this.client.on('turn_complete', () => {
            console.info('Model finished speaking');
        });

        this.client.on('tool_call', async (toolCall) => {
            await this.handleToolCall(toolCall);
        });
    }
        
    // TODO: Handle multiple function calls
    async handleToolCall(toolCall) {
        const functionCall = toolCall.functionCalls[0];
        const response = await this.toolManager.handleToolCall(functionCall);
        await this.client.sendToolResponse(response);
    }

    /**
     * Connects to the Gemini API using the GeminiWebsocketClient.connect() method.
     */
    async connect() {
        this.client = new GeminiWebsocketClient(this.name, this.url, this.config);
        await this.client.connect();
        this.setupEventListeners();
        this.connected = true;
    }

    /**
     * Starts camera capture and sends images at regular intervals
     */
    async startCameraCapture() {
        if (!this.connected) {
            throw new Error('Must be connected to start camera capture');
        }

        try {
            await this.cameraManager.initialize();
            
            // Set up interval to capture and send images
            this.cameraInterval = setInterval(async () => {
                const imageBase64 = await this.cameraManager.capture();
                this.client.sendImage(imageBase64);                
            }, this.captureInterval);
            
            console.info('Camera capture started');
        } catch (error) {
            await this.disconnect();
            throw new Error('Failed to start camera capture: ' + error);
        }
    }

    /**
     * Stops camera capture and cleans up resources
     */
    async stopCameraCapture() {
        if (this.cameraInterval) {
            clearInterval(this.cameraInterval);
            this.cameraInterval = null;
        }
        
        if (this.cameraManager) {
            this.cameraManager.dispose();
        }
        
        console.info('Camera capture stopped');
    }

    /**
     * Starts screen sharing and sends screenshots at regular intervals
     */
    async startScreenShare() {
        if (!this.connected) {
            throw new Error('Websocket must be connected to start screen sharing');
        }

        try {
            await this.screenManager.initialize();
            
            // Set up interval to capture and send screenshots
            this.screenInterval = setInterval(async () => {
                const imageBase64 = await this.screenManager.capture();
                this.client.sendImage(imageBase64);
            }, this.captureInterval);
            
            console.info('Screen sharing started');
        } catch (error) {
            await this.stopScreenShare();
            throw new Error('Failed to start screen sharing: ' + error);
        }
    }

    /**
     * Stops screen sharing and cleans up resources
     */
    async stopScreenShare() {
        if (this.screenInterval) {
            clearInterval(this.screenInterval);
            this.screenInterval = null;
        }
        
        if (this.screenManager) {
            this.screenManager.dispose();
        }
        
        console.info('Screen sharing stopped');
    }

    /**
     * Gracefully terminates all active connections and streams.
     * Ensures proper cleanup of audio, screen sharing, and WebSocket resources.
     */
    async disconnect() {
        try {
            // Stop camera capture first
            await this.stopCameraCapture();

            // Stop screen sharing
            await this.stopScreenShare();

            // Cleanup audio resources in correct order
            if (this.audioRecorder) {
                this.audioRecorder.stop();
                this.audioRecorder = null;
            }

            // Cleanup audio visualizer before audio context
            if (this.visualizer) {
                this.visualizer.cleanup();
                this.visualizer = null;
            }

            // Clean up audio streamer before closing context
            if (this.audioStreamer) {
                this.audioStreamer.stop();
                this.audioStreamer = null;
            }

            // Finally close audio context
            if (this.audioContext) {
                await this.audioContext.close();
                this.audioContext = null;
            }

            // Cleanup WebSocket
            this.client.disconnect();
            this.client = null;
            this.initialized = false;
            this.connected = false;
            
            console.info('Disconnected and cleaned up all resources');
        } catch (error) {
            throw new Error('Disconnect error:' + error);
        }
    }

    /**
     * Initiates audio recording from the microphone.
     * Streams audio data to the model in real-time, handling interruptions
     */
    async initialize() {
        try {            
            // Initialize audio components
            this.audioContext = new AudioContext();
            this.audioStreamer = new AudioStreamer(this.audioContext);
            this.audioStreamer.initialize();
            this.visualizer = new AudioVisualizer(this.audioContext, 'visualizer');
            this.audioStreamer.gainNode.connect(this.visualizer.analyser);
            this.visualizer.start();
            this.audioRecorder = new AudioRecorder();
            
            this.initialized = true;
            console.info(`${this.client.name} initialized successfully`);
            this.client.sendText('.');  // Trigger the model to start speaking first
        } catch (error) {
            throw new Error('Error during the initialization of the client:' + error);
        }
    }

    async startRecording() {
        // Start recording with callback to send audio data to websocket
        await this.audioRecorder.start(async (audioData) => {
            try {
                this.client.sendAudio(audioData);
            } catch (error) {
                console.error('Error sending audio data to websocket:', error);
                this.audioRecorder.stop();
            }
        });
    }

    /**
     * Toggles the microphone state between active and suspended
     */
    async toggleMic() {
        if (!this.audioRecorder.stream) {
            await this.startRecording();
            return;
        }
        await this.audioRecorder.toggleMic();
    }           

    // Add event emitter functionality
    on(eventName, callback) {
        if (!this._eventListeners) {
            this._eventListeners = new Map();
        }
        if (!this._eventListeners.has(eventName)) {
            this._eventListeners.set(eventName, []);
        }
        this._eventListeners.get(eventName).push(callback);
    }

    emit(eventName, data) {
        if (!this._eventListeners || !this._eventListeners.has(eventName)) {
            return;
        }
        for (const callback of this._eventListeners.get(eventName)) {
            callback(data);
        }
    }
}