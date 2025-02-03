import elements from './elements.js';

export function initializeSettings() {
    // Load values from localStorage
    elements.apiKeyInput.value = localStorage.getItem('apiKey') || '';
    elements.deepgramApiKeyInput.value = localStorage.getItem('deepgramApiKey') || '';
    elements.voiceSelect.value = localStorage.getItem('voiceName') || 'Aoede';
    elements.sampleRateInput.value = localStorage.getItem('sampleRate') || '27000';
    elements.systemInstructionsInput.value = localStorage.getItem('systemInstructions') || 'You are a helpful assistant';
    elements.temperatureInput.value = localStorage.getItem('temperature') || '1.8';
    elements.topPInput.value = localStorage.getItem('top_p') || '0.95';
    elements.topKInput.value = localStorage.getItem('top_k') || '65';

    // Initialize screen & camera settings
    elements.fpsInput.value = localStorage.getItem('fps') || '1';
    elements.resizeWidthInput.value = localStorage.getItem('resizeWidth') || '640';
    elements.qualityInput.value = localStorage.getItem('quality') || '0.3';

    // Initialize safety settings
    elements.harassmentInput.value = localStorage.getItem('harassmentThreshold') || '3';
    elements.dangerousInput.value = localStorage.getItem('dangerousContentThreshold') || '3';
    elements.sexualInput.value = localStorage.getItem('sexuallyExplicitThreshold') || '3';
    elements.civicInput.value = localStorage.getItem('civicIntegrityThreshold') || '3';

    // Update display values
    updateDisplayValues();

    // Add input listeners for real-time value updates
    elements.sampleRateInput.addEventListener('input', updateDisplayValues);
    elements.temperatureInput.addEventListener('input', updateDisplayValues);
    elements.topPInput.addEventListener('input', updateDisplayValues);
    elements.topKInput.addEventListener('input', updateDisplayValues);
    elements.fpsInput.addEventListener('input', updateDisplayValues);
    elements.resizeWidthInput.addEventListener('input', updateDisplayValues);
    elements.qualityInput.addEventListener('input', updateDisplayValues);
    elements.harassmentInput.addEventListener('input', updateDisplayValues);
    elements.dangerousInput.addEventListener('input', updateDisplayValues);
    elements.sexualInput.addEventListener('input', updateDisplayValues);
    elements.civicInput.addEventListener('input', updateDisplayValues);
}

// Update display values for range inputs
function updateDisplayValues() {
    elements.sampleRateValue.textContent = elements.sampleRateInput.value + ' Hz';
    elements.temperatureValue.textContent = elements.temperatureInput.value;
    elements.topPValue.textContent = elements.topPInput.value;
    elements.topKValue.textContent = elements.topKInput.value;
    elements.fpsValue.textContent = elements.fpsInput.value + ' FPS';
    elements.resizeWidthValue.textContent = elements.resizeWidthInput.value + 'px';
    elements.qualityValue.textContent = elements.qualityInput.value;
    elements.harassmentValue.textContent = getThresholdLabel(elements.harassmentInput.value);
    elements.dangerousValue.textContent = getThresholdLabel(elements.dangerousInput.value);
    elements.sexualValue.textContent = getThresholdLabel(elements.sexualInput.value);
    elements.civicValue.textContent = getThresholdLabel(elements.civicInput.value);
}

// Helper function to convert threshold number to label
function getThresholdLabel(value) {
    const labels = {
        '0': 'None',
        '1': 'Low',
        '2': 'Medium',
        '3': 'High'
    };
    return labels[value] || value;
}

// Save settings to localStorage
export function saveSettings() {
    localStorage.setItem('apiKey', elements.apiKeyInput.value);
    localStorage.setItem('deepgramApiKey', elements.deepgramApiKeyInput.value);
    localStorage.setItem('voiceName', elements.voiceSelect.value);
    localStorage.setItem('sampleRate', elements.sampleRateInput.value);
    localStorage.setItem('systemInstructions', elements.systemInstructionsInput.value);
    localStorage.setItem('temperature', elements.temperatureInput.value);
    localStorage.setItem('top_p', elements.topPInput.value);
    localStorage.setItem('top_k', elements.topKInput.value);
    
    // Save screen & camera settings
    localStorage.setItem('fps', elements.fpsInput.value);
    localStorage.setItem('resizeWidth', elements.resizeWidthInput.value);
    localStorage.setItem('quality', elements.qualityInput.value);

    // Save safety settings
    localStorage.setItem('harassmentThreshold', elements.harassmentInput.value);
    localStorage.setItem('dangerousContentThreshold', elements.dangerousInput.value);
    localStorage.setItem('sexuallyExplicitThreshold', elements.sexualInput.value);
    localStorage.setItem('civicIntegrityThreshold', elements.civicInput.value);
}

// Toggle collapsible sections
export function toggleCollapsible(toggle, content) {
    const isActive = content.classList.contains('active');
    content.classList.toggle('active');
    if (isActive) {
        toggle.textContent = toggle.textContent.replace('▼', '▲');
    } else {
        toggle.textContent = toggle.textContent.replace('▲', '▼');
    }
}

// Show settings dialog
export function showSettings() {
    elements.settingsDialog.classList.add('active');
    elements.settingsOverlay.classList.add('active');
}

// Hide settings dialog
export function hideSettings() {
    elements.settingsDialog.classList.remove('active');
    elements.settingsOverlay.classList.remove('active');
}
