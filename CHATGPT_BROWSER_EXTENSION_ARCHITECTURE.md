# ChatGPT Browser Extension Architecture

## Overview

This document outlines the architecture for a simple ChatGPT browser extension that provides 6 core features for interacting with chat.openai.com. The extension uses Manifest V3 and follows Chrome Extension best practices.

**Core Features**:
1. Create project
2. Add instructions to projects
3. Create new chat conversations
4. Send prompts to ChatGPT
5. Request image generation
6. Download generated images

## Extension Structure

```
chatgpt-extension/
├── manifest.json           # Manifest V3 configuration
├── background/
│   └── service-worker.js   # Background service worker
├── content/
│   ├── chatgpt-content.js  # Content script for chat.openai.com
│   └── chatgpt-content.css # Styling for injected elements
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup logic
│   └── popup.css           # Popup styling
├── storage/
│   └── storage-manager.js  # Storage API wrapper
└── images/
    ├── icon-16.png         # Extension icons
    ├── icon-48.png
    └── icon-128.png
```

## Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "ChatGPT Assistant",
  "version": "1.0.0",
  "description": "Simple ChatGPT browser extension for project management and automation",
  
  "permissions": [
    "storage",
    "tabs",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://chat.openai.com/*"
  ],
  
  "background": {
    "service_worker": "background/service-worker.js"
  },
  
  "content_scripts": [
    {
      "matches": ["https://chat.openai.com/*"],
      "js": ["storage/storage-manager.js", "content/chatgpt-content.js"],
      "css": ["content/chatgpt-content.css"],
      "run_at": "document_idle"
    }
  ],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "images/icon-16.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png"
    }
  },
  
  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  }
}
```

## Component Architecture

### 1. Content Script (chatgpt-content.js)

The content script runs on chat.openai.com and provides direct DOM manipulation and interaction capabilities.

```javascript
// content/chatgpt-content.js

class ChatGPTInterface {
  constructor() {
    this.init();
  }

  init() {
    // Wait for ChatGPT interface to load
    this.waitForChatInterface();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async waitForChatInterface() {
    // Wait for ChatGPT textarea and other elements to load
    const observer = new MutationObserver((mutations, obs) => {
      const textarea = document.querySelector('textarea[data-id]');
      if (textarea) {
        this.textarea = textarea;
        this.setupInterface();
        obs.disconnect();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupInterface() {
    // Interface is ready, notify background script
    chrome.runtime.sendMessage({ type: 'CHATGPT_READY' });
  }

  async handleMessage(request, sendResponse) {
    switch (request.action) {
      case 'CREATE_CHAT':
        await this.createNewChat();
        sendResponse({ success: true });
        break;
        
      case 'SEND_PROMPT':
        await this.sendPrompt(request.prompt);
        sendResponse({ success: true });
        break;
        
      case 'REQUEST_IMAGE':
        await this.requestImage(request.prompt);
        sendResponse({ success: true });
        break;
        
      case 'DOWNLOAD_IMAGES':
        const images = await this.downloadImages();
        sendResponse({ success: true, images });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  async createNewChat() {
    // Click new chat button
    const newChatButton = document.querySelector('a[href="/"]');
    if (newChatButton) {
      newChatButton.click();
      await this.waitForPageLoad();
    }
  }

  async sendPrompt(prompt) {
    if (!this.textarea) {
      throw new Error('ChatGPT interface not ready');
    }
    
    // Set prompt text
    this.textarea.value = prompt;
    
    // Trigger input event
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Find and click send button
    const sendButton = this.textarea.parentElement.querySelector('button[data-testid="send-button"]');
    if (sendButton && !sendButton.disabled) {
      sendButton.click();
    }
  }

  async requestImage(prompt) {
    // Prepend image generation instruction
    const imagePrompt = `Please generate an image with the following description: ${prompt}`;
    await this.sendPrompt(imagePrompt);
  }

  async downloadImages() {
    // Find all generated images in the conversation
    const images = document.querySelectorAll('img[src*="dalle"]');
    const imageUrls = Array.from(images).map(img => img.src);
    
    // Download each image
    const downloads = imageUrls.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);
      return {
        url: url,
        dataUrl: dataUrl,
        filename: `chatgpt-image-${Date.now()}-${index}.png`
      };
    });
    
    return Promise.all(downloads);
  }

  blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  waitForPageLoad() {
    return new Promise(resolve => {
      setTimeout(resolve, 1000); // Simple wait, can be improved
    });
  }
}

// Initialize interface
new ChatGPTInterface();
```

### 2. Background Service Worker

The service worker manages extension state, coordinates between components, and handles storage operations.

```javascript
// background/service-worker.js

import { StorageManager } from '../storage/storage-manager.js';

class ChatGPTExtension {
  constructor() {
    this.storage = new StorageManager();
    this.activeTabId = null;
    this.init();
  }

  init() {
    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    // Track active ChatGPT tab
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url && tab.url.includes('chat.openai.com')) {
        this.activeTabId = activeInfo.tabId;
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.type) {
      case 'CREATE_PROJECT':
        await this.createProject(request.data);
        sendResponse({ success: true });
        break;
        
      case 'ADD_INSTRUCTIONS':
        await this.addInstructions(request.projectId, request.instructions);
        sendResponse({ success: true });
        break;
        
      case 'GET_PROJECTS':
        const projects = await this.getProjects();
        sendResponse({ success: true, projects });
        break;
        
      case 'EXECUTE_ACTION':
        await this.executeAction(request.action, request.data);
        sendResponse({ success: true });
        break;
        
      case 'CHATGPT_READY':
        console.log('ChatGPT interface ready');
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async createProject(projectData) {
    const project = {
      id: `project-${Date.now()}`,
      name: projectData.name,
      instructions: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    await this.storage.saveProject(project);
    return project;
  }

  async addInstructions(projectId, instructions) {
    const project = await this.storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    project.instructions.push({
      id: `instruction-${Date.now()}`,
      text: instructions,
      created: new Date().toISOString()
    });
    
    project.updated = new Date().toISOString();
    await this.storage.saveProject(project);
  }

  async getProjects() {
    return await this.storage.getAllProjects();
  }

  async executeAction(action, data) {
    if (!this.activeTabId) {
      throw new Error('No active ChatGPT tab found');
    }
    
    // Send action to content script
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        this.activeTabId,
        { action, ...data },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Action failed'));
          }
        }
      );
    });
  }
}

// Initialize extension
new ChatGPTExtension();
```

### 3. Storage Manager

Wrapper for Chrome storage API with project management utilities.

```javascript
// storage/storage-manager.js

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'chatgpt_projects';
  }

  async getAllProjects() {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    return result[this.STORAGE_KEY] || [];
  }

  async getProject(projectId) {
    const projects = await this.getAllProjects();
    return projects.find(p => p.id === projectId);
  }

  async saveProject(project) {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    await chrome.storage.local.set({ [this.STORAGE_KEY]: projects });
  }

  async deleteProject(projectId) {
    const projects = await this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    await chrome.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }

  async getSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || {};
  }

  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
```

### 4. Message Passing Architecture

```javascript
// Message types and flow

// Popup -> Background Service Worker
const messageTypes = {
  // Project management
  CREATE_PROJECT: 'CREATE_PROJECT',
  ADD_INSTRUCTIONS: 'ADD_INSTRUCTIONS',
  GET_PROJECTS: 'GET_PROJECTS',
  DELETE_PROJECT: 'DELETE_PROJECT',
  
  // ChatGPT actions
  EXECUTE_ACTION: 'EXECUTE_ACTION'
};

// Background -> Content Script
const actionTypes = {
  CREATE_CHAT: 'CREATE_CHAT',
  SEND_PROMPT: 'SEND_PROMPT',
  REQUEST_IMAGE: 'REQUEST_IMAGE',
  DOWNLOAD_IMAGES: 'DOWNLOAD_IMAGES'
};

// Message flow example:
// 1. User clicks "Send Prompt" in popup
// 2. Popup sends EXECUTE_ACTION message to background
// 3. Background forwards SEND_PROMPT action to content script
// 4. Content script executes action on ChatGPT page
// 5. Response flows back through the chain
```

### 5. Popup Interface

Simple UI for managing projects and triggering actions.

```html
<!-- popup/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h2>ChatGPT Assistant</h2>
    
    <!-- Project Management -->
    <div class="section">
      <h3>Projects</h3>
      <select id="projectSelect">
        <option value="">Select a project...</option>
      </select>
      <button id="newProjectBtn">New Project</button>
    </div>
    
    <!-- Instructions -->
    <div class="section">
      <h3>Instructions</h3>
      <textarea id="instructionsText" placeholder="Add instructions for this project..."></textarea>
      <button id="addInstructionsBtn">Add Instructions</button>
    </div>
    
    <!-- Actions -->
    <div class="section">
      <h3>Actions</h3>
      <button id="createChatBtn">Create New Chat</button>
      <input type="text" id="promptInput" placeholder="Enter prompt...">
      <button id="sendPromptBtn">Send Prompt</button>
      <button id="requestImageBtn">Request Image</button>
      <button id="downloadImagesBtn">Download Images</button>
    </div>
    
    <!-- Status -->
    <div id="status" class="status"></div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

```javascript
// popup/popup.js

class PopupInterface {
  constructor() {
    this.currentProject = null;
    this.init();
  }

  async init() {
    // Load projects
    await this.loadProjects();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Project management
    document.getElementById('projectSelect').addEventListener('change', (e) => {
      this.selectProject(e.target.value);
    });
    
    document.getElementById('newProjectBtn').addEventListener('click', () => {
      this.createNewProject();
    });
    
    document.getElementById('addInstructionsBtn').addEventListener('click', () => {
      this.addInstructions();
    });
    
    // ChatGPT actions
    document.getElementById('createChatBtn').addEventListener('click', () => {
      this.executeAction('CREATE_CHAT');
    });
    
    document.getElementById('sendPromptBtn').addEventListener('click', () => {
      const prompt = document.getElementById('promptInput').value;
      if (prompt) {
        this.executeAction('SEND_PROMPT', { prompt });
      }
    });
    
    document.getElementById('requestImageBtn').addEventListener('click', () => {
      const prompt = document.getElementById('promptInput').value;
      if (prompt) {
        this.executeAction('REQUEST_IMAGE', { prompt });
      }
    });
    
    document.getElementById('downloadImagesBtn').addEventListener('click', () => {
      this.executeAction('DOWNLOAD_IMAGES');
    });
  }

  async loadProjects() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROJECTS' });
    if (response.success) {
      this.updateProjectList(response.projects);
    }
  }

  updateProjectList(projects) {
    const select = document.getElementById('projectSelect');
    select.innerHTML = '<option value="">Select a project...</option>';
    
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      select.appendChild(option);
    });
  }

  async createNewProject() {
    const name = prompt('Enter project name:');
    if (name) {
      await chrome.runtime.sendMessage({
        type: 'CREATE_PROJECT',
        data: { name }
      });
      
      await this.loadProjects();
      this.showStatus('Project created successfully');
    }
  }

  selectProject(projectId) {
    this.currentProject = projectId;
    // Could load project instructions here
  }

  async addInstructions() {
    if (!this.currentProject) {
      this.showStatus('Please select a project first', 'error');
      return;
    }
    
    const instructions = document.getElementById('instructionsText').value;
    if (instructions) {
      await chrome.runtime.sendMessage({
        type: 'ADD_INSTRUCTIONS',
        projectId: this.currentProject,
        instructions
      });
      
      document.getElementById('instructionsText').value = '';
      this.showStatus('Instructions added successfully');
    }
  }

  async executeAction(action, data = {}) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXECUTE_ACTION',
        action,
        data
      });
      
      if (response.success) {
        this.showStatus(`Action "${action}" executed successfully`);
        
        // Handle special cases
        if (action === 'DOWNLOAD_IMAGES' && response.images) {
          this.downloadImages(response.images);
        }
      } else {
        this.showStatus(`Action failed: ${response.error}`, 'error');
      }
    } catch (error) {
      this.showStatus(`Error: ${error.message}`, 'error');
    }
  }

  downloadImages(images) {
    images.forEach(image => {
      const a = document.createElement('a');
      a.href = image.dataUrl;
      a.download = image.filename;
      a.click();
    });
  }

  showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 3000);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupInterface();
});
```

### 6. API Documentation

```javascript
// Extension API for the 6 core features

class ChatGPTExtensionAPI {
  /**
   * 1. Create a new project
   * @param {string} name - Project name
   * @returns {Promise<Project>} Created project object
   */
  async createProject(name) {
    return await chrome.runtime.sendMessage({
      type: 'CREATE_PROJECT',
      data: { name }
    });
  }

  /**
   * 2. Add instructions to a project
   * @param {string} projectId - Project ID
   * @param {string} instructions - Instructions text
   * @returns {Promise<void>}
   */
  async addInstructions(projectId, instructions) {
    return await chrome.runtime.sendMessage({
      type: 'ADD_INSTRUCTIONS',
      projectId,
      instructions
    });
  }

  /**
   * 3. Create a new chat conversation
   * @returns {Promise<void>}
   */
  async createChat() {
    return await chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      action: 'CREATE_CHAT'
    });
  }

  /**
   * 4. Send a prompt to ChatGPT
   * @param {string} prompt - The prompt text
   * @returns {Promise<void>}
   */
  async sendPrompt(prompt) {
    return await chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      action: 'SEND_PROMPT',
      data: { prompt }
    });
  }

  /**
   * 5. Request image generation
   * @param {string} prompt - Image description
   * @returns {Promise<void>}
   */
  async requestImage(prompt) {
    return await chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      action: 'REQUEST_IMAGE',
      data: { prompt }
    });
  }

  /**
   * 6. Download generated images
   * @returns {Promise<Array<{url: string, dataUrl: string, filename: string}>>}
   */
  async downloadImages() {
    const response = await chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      action: 'DOWNLOAD_IMAGES'
    });
    return response.images;
  }
}
```

## Installation & Usage

1. **Load Extension**:
   - Open Chrome Extensions page (chrome://extensions/)
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the extension directory

2. **Using the Extension**:
   - Navigate to chat.openai.com
   - Click the extension icon to open popup
   - Create a project
   - Add instructions
   - Use the action buttons to interact with ChatGPT

## Security Considerations

- Extension only has permissions for chat.openai.com
- No external API calls except to ChatGPT
- All data stored locally in Chrome storage
- No tracking or analytics
- Minimal permissions requested

## Future Enhancements

- Batch prompt execution
- Project templates
- Export/import projects
- Keyboard shortcuts
- Response parsing and extraction
- Automated workflow sequences

---

This architecture provides a simple, practical foundation for a ChatGPT browser extension focused on the 6 core features requested.