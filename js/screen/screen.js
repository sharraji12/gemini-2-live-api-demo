/**
 * Manages screen sharing capture and image processing
 */
export class ScreenManager {
    constructor(config) {
        this.config = {
            width: config.width || 1280,
            quality: config.quality || 0.8,
            onStop: config.onStop
        };
        
        this.stream = null;
        this.videoElement = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        this.aspectRatio = null;
        this.previewContainer = null;
    }

    /**
     * Check if the device is mobile
     * @returns {boolean}
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Initialize screen capture stream and canvas
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Configure different constraints for mobile and desktop
            const constraints = {
                video: {
                    cursor: "always"
                },
                audio: false
            };

            // Add mobile-specific constraints
            if (this.isMobileDevice()) {
                constraints.video = {
                    ...constraints.video,
                    // Add mobile-specific constraints
                    displaySurface: ['application', 'browser', 'window'],
                    logicalSurface: true,
                    // Try to ensure better mobile compatibility
                    frameRate: { ideal: 15, max: 30 },
                    width: { ideal: 720 },
                    height: { ideal: 1280 }
                };
            }

            // Request screen sharing with appropriate constraints
            this.stream = await navigator.mediaDevices.getDisplayMedia(constraints);

            // Create and setup video element
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.stream;
            this.videoElement.playsInline = true; // Important for iOS
            this.videoElement.autoplay = true; // Important for mobile
            this.videoElement.muted = true; // Required for autoplay on mobile

            // Add video to preview container
            const previewContainer = document.getElementById('screenPreview');
            if (previewContainer) {
                previewContainer.appendChild(this.videoElement);
                this.previewContainer = previewContainer;
                this.showPreview();
            }

            await this.videoElement.play();

            // Get the actual video dimensions
            const videoWidth = this.videoElement.videoWidth;
            const videoHeight = this.videoElement.videoHeight;
            this.aspectRatio = videoHeight / videoWidth;

            // Calculate canvas size maintaining aspect ratio
            const canvasWidth = Math.min(this.config.width, window.innerWidth);
            const canvasHeight = Math.round(canvasWidth * this.aspectRatio);

            // Create canvas for image processing
            this.canvas = document.createElement('canvas');
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            // Listen for the end of screen sharing
            this.stream.getVideoTracks()[0].addEventListener('ended', () => {
                this.dispose();
                if (this.config.onStop) {
                    this.config.onStop();
                }
            });

            // Handle visibility change for mobile
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.stream) {
                    this.dispose();
                    if (this.config.onStop) {
                        this.config.onStop();
                    }
                }
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Screen capture initialization error:', error);
            throw new Error(`Failed to initialize screen capture: ${error.message}`);
        }
    }

    // ... rest of the existing methods remain the same ...
}
