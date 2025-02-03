// DOM elements object
const elements = {
    // Button elements
    disconnectBtn: document.getElementById('disconnectBtn'),
    connectBtn: document.getElementById('connectBtn'),
    micBtn: document.getElementById('micBtn'),
    cameraBtn: document.getElementById('cameraBtn'),
    screenBtn: document.getElementById('screenBtn'),
    settingsBtn: document.getElementById('settingsBtn'),

    // Preview elements
    cameraPreview: document.getElementById('cameraPreview'),
    screenPreview: document.getElementById('screenPreview'),

    // Text input elements
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),

    // Visualizer canvas
    visualizerCanvas: document.getElementById('visualizer'),

    // Settings elements
    settingsDialog: document.createElement('div'),
    settingsOverlay: document.createElement('div'),
    settingsSaveBtn: null
};

// Initialize settings dialog
elements.settingsDialog.className = 'settings-dialog';
elements.settingsDialog.innerHTML = `
    <div class="settings-group">
        <label for="apiKey">Gemini API Key</label>
        <input type="password" id="apiKey" placeholder="Enter your Gemini API key">
    </div>
    
    <div class="settings-group">
        <label for="deepgramApiKey">Deepgram API Key (Optional)</label>
        <input type="password" id="deepgramApiKey" placeholder="Enter your Deepgram API key">
    </div>
    
    <div class="settings-group">
        <label for="voice">Voice</label>
        <select id="voice">
            <option value="Puck">Puck</option>
            <option value="Charon">Charon</option>
            <option value="Kore">Kore</option>
            <option value="Fenrir">Fenrir</option>
            <option value="Aoede">Aoede</option>
        </select>
    </div>
    
    <div class="settings-group">
        <label for="sampleRate">Sample Rate</label>
        <input type="range" id="sampleRate" min="8000" max="48000" step="1000">
        <span id="sampleRateValue"></span>
    </div>
    
    <div class="settings-group">
        <div class="collapsible" id="systemInstructionsToggle">System Instructions ▼</div>
        <div class="collapsible-content">
            <textarea id="systemInstructions" rows="4" placeholder="Enter system instructions"></textarea>
        </div>
    </div>
    
    <div class="settings-group">
        <div class="collapsible" id="screenCameraToggle">Screen&Camera ▼</div>
        <div class="collapsible-content">
            <div class="settings-group">
                <label for="fps">FPS (1-10)</label>
                <input type="range" id="fps" min="1" max="10" step="1">
                <span id="fpsValue"></span>
            </div>
            <div class="settings-group">
                <label for="resizeWidth">Resize Width (640-1920)</label>
                <input type="range" id="resizeWidth" min="640" max="1920" step="80">
                <span id="resizeWidthValue"></span>
            </div>
            <div class="settings-group">
                <label for="quality">Quality (0.1-1)</label>
                <input type="range" id="quality" min="0.1" max="1" step="0.1">
                <span id="qualityValue"></span>
            </div>
        </div>
    </div>
    
    <div class="settings-group">
        <div class="collapsible" id="advancedToggle">Advanced Settings ▼</div>
        <div class="collapsible-content">
            <div class="settings-group">
                <label for="temperature">Temperature (0-2)</label>
                <input type="range" id="temperature" min="0" max="2" step="0.1">
                <span id="temperatureValue"></span>
            </div>
            <div class="settings-group">
                <label for="topP">Top P (0-1)</label>
                <input type="range" id="topP" min="0" max="1" step="0.05">
                <span id="topPValue"></span>
            </div>
            <div class="settings-group">
                <label for="topK">Top K (1-100)</label>
                <input type="range" id="topK" min="1" max="100" step="1">
                <span id="topKValue"></span>
            </div>
        </div>
    </div>
    
    <div class="settings-group">
        <div class="collapsible" id="safetyToggle">Safety Settings (Blocking Strength) ▼</div>
        <div class="collapsible-content">
            <div class="settings-group">
                <label for="harassmentThreshold">Harassment (0-3)</label>
                <input type="range" id="harassmentThreshold" min="0" max="3" step="1">
                <span id="harassmentValue"></span>
            </div>
            <div class="settings-group">
                <label for="dangerousContentThreshold">Dangerous Content (0-3)</label>
                <input type="range" id="dangerousContentThreshold" min="0" max="3" step="1">
                <span id="dangerousValue"></span>
            </div>
            <div class="settings-group">
                <label for="sexuallyExplicitThreshold">Sexually Explicit (0-3)</label>
                <input type="range" id="sexuallyExplicitThreshold" min="0" max="3" step="1">
                <span id="sexualValue"></span>
            </div>
            <div class="settings-group">
                <label for="civicIntegrityThreshold">Civic Integrity (0-3)</label>
                <input type="range" id="civicIntegrityThreshold" min="0" max="3" step="1">
                <span id="civicValue"></span>
            </div>
        </div>
    </div>
    
    <button id="settingsSaveBtn" class="settings-save-btn">Save Settings</button>
`;

elements.settingsOverlay.className = 'settings-overlay';

// Settings Elements
elements.apiKeyInput = elements.settingsDialog.querySelector('#apiKey');
elements.deepgramApiKeyInput = elements.settingsDialog.querySelector('#deepgramApiKey');
elements.voiceSelect = elements.settingsDialog.querySelector('#voice');
elements.sampleRateInput = elements.settingsDialog.querySelector('#sampleRate');
elements.sampleRateValue = elements.settingsDialog.querySelector('#sampleRateValue');
elements.systemInstructionsToggle = elements.settingsDialog.querySelector('#systemInstructionsToggle');
elements.systemInstructionsContent = elements.settingsDialog.querySelector('#systemInstructions').parentElement;
elements.systemInstructionsInput = elements.settingsDialog.querySelector('#systemInstructions');
elements.screenCameraToggle = elements.settingsDialog.querySelector('#screenCameraToggle');
elements.screenCameraContent = elements.settingsDialog.querySelector('#screenCameraToggle + .collapsible-content');
elements.fpsInput = elements.settingsDialog.querySelector('#fps');
elements.fpsValue = elements.settingsDialog.querySelector('#fpsValue');
elements.resizeWidthInput = elements.settingsDialog.querySelector('#resizeWidth');
elements.resizeWidthValue = elements.settingsDialog.querySelector('#resizeWidthValue');
elements.qualityInput = elements.settingsDialog.querySelector('#quality');
elements.qualityValue = elements.settingsDialog.querySelector('#qualityValue');
elements.advancedToggle = elements.settingsDialog.querySelector('#advancedToggle');
elements.advancedContent = elements.settingsDialog.querySelector('#advancedToggle + .collapsible-content');
elements.temperatureInput = elements.settingsDialog.querySelector('#temperature');
elements.temperatureValue = elements.settingsDialog.querySelector('#temperatureValue');
elements.topPInput = elements.settingsDialog.querySelector('#topP');
elements.topPValue = elements.settingsDialog.querySelector('#topPValue');
elements.topKInput = elements.settingsDialog.querySelector('#topK');
elements.topKValue = elements.settingsDialog.querySelector('#topKValue');

// Safety Settings Elements
elements.safetyToggle = elements.settingsDialog.querySelector('#safetyToggle');
elements.safetyContent = elements.settingsDialog.querySelector('#safetyToggle + .collapsible-content');
elements.harassmentInput = elements.settingsDialog.querySelector('#harassmentThreshold');
elements.harassmentValue = elements.settingsDialog.querySelector('#harassmentValue');
elements.dangerousInput = elements.settingsDialog.querySelector('#dangerousContentThreshold');
elements.dangerousValue = elements.settingsDialog.querySelector('#dangerousValue');
elements.sexualInput = elements.settingsDialog.querySelector('#sexuallyExplicitThreshold');
elements.sexualValue = elements.settingsDialog.querySelector('#sexualValue');
elements.civicInput = elements.settingsDialog.querySelector('#civicIntegrityThreshold');
elements.civicValue = elements.settingsDialog.querySelector('#civicValue');

elements.settingsSaveBtn = elements.settingsDialog.querySelector('#settingsSaveBtn');

// Add dialog and overlay to the document
document.body.appendChild(elements.settingsDialog);
document.body.appendChild(elements.settingsOverlay);

export default elements;
