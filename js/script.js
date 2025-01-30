import { GeminiAgent } from './main/agent.js';

import { getConfig } from './config/config.js';
import { getWebsocketUrl } from './config/config.js';

import { GoogleSearchTool } from './tools/google-search.js';
import { ToolManager } from './tools/tool-manager.js';

import { setupEventListeners, initializeSettingsEvents } from './dom/events.js';

const url = getWebsocketUrl();
const config = getConfig();

const toolManager = new ToolManager();
toolManager.registerTool('googleSearch', new GoogleSearchTool());

const geminiAgent = new GeminiAgent('GeminiAgent', url, config, toolManager);
geminiAgent.connect();

setupEventListeners(geminiAgent);

// Initialize settings
initializeSettingsEvents();