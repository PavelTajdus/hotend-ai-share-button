/**
 * Assistant URL Builders for Hotend.cz AI Share Button
 * Handles web version URLs for different AI assistants
 */

// Maximum query length to prevent URL issues
const MAX_QUERY_LENGTH = 3000;

// Encode and limit query string
function encodeQ(query) {
    if (typeof query !== 'string') {
        return '';
    }
    
    let limitedQuery = query;
    if (query.length > MAX_QUERY_LENGTH) {
        limitedQuery = query.slice(0, MAX_QUERY_LENGTH) + '…';
    }
    
    return encodeURIComponent(limitedQuery);
}

// Build Perplexity web URL
function buildPerplexityWebUrl(query) {
    const encodedQuery = encodeQ(query);
    return `https://www.perplexity.ai/search?q=${encodedQuery}`;
}

// Build ChatGPT web URL
function buildChatGPTWebUrl(query) {
    const encodedQuery = encodeQ(query);
    return `https://chatgpt.com/?q=${encodedQuery}`;
}

// Build Claude web URL
// Note: Claude web doesn't reliably support prefilled queries via URL params
// We rely on clipboard content instead
function buildClaudeWebUrl(query) {
    // Claude.ai doesn't support reliable query prefilling via URL
    // The /new endpoint opens a new conversation but doesn't prefill
    // We rely on the clipboard content being pasted by the user
    return 'https://claude.ai/new';
}

// Build Gemini web URL
function buildGeminiWebUrl(query) {
    // Gemini web app doesn't support query parameters for prefilling
    // Users need to paste from clipboard
    return 'https://gemini.google.com/app';
}

// Build Copilot web URL
function buildCopilotWebUrl(query) {
    const encodedQuery = encodeQ(query);
    return `https://copilot.microsoft.com/?q=${encodedQuery}`;
}

// Generic assistant URL builder
function buildAssistantWebUrl(assistant, query) {
    switch (assistant.toLowerCase()) {
        case 'perplexity':
            return buildPerplexityWebUrl(query);
        case 'chatgpt':
            return buildChatGPTWebUrl(query);
        case 'claude':
            return buildClaudeWebUrl(query);
        case 'gemini':
            return buildGeminiWebUrl(query);
        case 'copilot':
            return buildCopilotWebUrl(query);
        default:
            console.warn(`Unknown assistant: ${assistant}, defaulting to Perplexity`);
            return buildPerplexityWebUrl(query);
    }
}

// Get assistant display information
function getAssistantInfo(assistant) {
    const assistantData = {
        perplexity: {
            name: 'Perplexity',
            icon: '🔍',
            description: 'Proberte tento produkt s vyhledávací AI',
            supportsUrlPrefill: true
        },
        chatgpt: {
            name: 'ChatGPT',
            icon: '💬',
            description: 'Proberte tento produkt s AI od OpenAI',
            supportsUrlPrefill: true
        },
        claude: {
            name: 'Claude',
            icon: '🤖',
            description: 'Text se zkopíruje - vložte do chatu (Ctrl+V / ⌘+V)',
            supportsUrlPrefill: false
        },
        gemini: {
            name: 'Gemini',
            icon: '✨',
            description: 'Text se zkopíruje - vložte do chatu (Ctrl+V / ⌘+V)',
            supportsUrlPrefill: false
        },
        copilot: {
            name: 'Copilot',
            icon: '🚁',
            description: 'Proberte tento produkt s AI od Microsoft',
            supportsUrlPrefill: true
        }
    };
    
    return assistantData[assistant.toLowerCase()] || assistantData.perplexity;
}

// Test URL validity (basic check)
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.assistantUtils = {
        encodeQ,
        buildPerplexityWebUrl,
        buildChatGPTWebUrl,
        buildClaudeWebUrl,
        buildGeminiWebUrl,
        buildCopilotWebUrl,
        buildAssistantWebUrl,
        getAssistantInfo,
        isValidUrl,
        MAX_QUERY_LENGTH
    };
    
    // Also export the main function directly for shareFlow.js
    window.buildAssistantWebUrl = buildAssistantWebUrl;
}