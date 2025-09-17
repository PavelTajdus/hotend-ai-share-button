/**
 * Share Flow Module for Hotend.cz AI Share Button
 * Handles mobile Web Share API and desktop fallback flows
 */

// Default configuration flags
const DEFAULT_CONFIG = {
    MOBILE_SHARE_FLOW: true,
    DESKTOP_DEEPLINK_FLOW: true,
    COPY_ALWAYS: true,
    PREFERRED_ASSISTANT: 'perplexity',
    TOAST_DURATION_MS: 3200
};

// Configurable settings - can be overridden from outside
let CONFIG = { ...DEFAULT_CONFIG };

// Mobile detection
const detect = {
    get isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    }
};

// Web Share API detection
function canWebShare() {
    return 'share' in navigator && typeof navigator.share === 'function';
}

// Build share payload for Web Share API
function buildSharePayload({ productTitle, productUrl, promptText }) {
    const title = productTitle || 'Produkt z Hotend.cz';
    const instructionText = '(Stačí vložit do vstupu AI a odeslat.)';
    const text = `${promptText}\n\n${instructionText}`;
    
    return {
        title: title,
        text: text,
        url: productUrl
    };
}

// Share using Web Share API
async function sharePrompt({ title, text, url }) {
    try {
        await navigator.share({ title, text, url });
        return { success: true };
    } catch (error) {
        // User cancelled or error occurred
        if (error.name === 'AbortError') {
            return { success: false, cancelled: true, error };
        }
        return { success: false, cancelled: false, error };
    }
}

// Copy to clipboard with fallback
async function copyToClipboard(text, url = '') {
    const fullText = url ? `${text}\n\n${url}` : text;
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(fullText);
            return { success: true };
        } else {
            // Fallback for older browsers
            return legacyCopy(fullText);
        }
    } catch (error) {
        console.warn('Clipboard API failed, using fallback:', error);
        return legacyCopy(fullText);
    }
}

// Legacy clipboard fallback
function legacyCopy(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return { success };
    } catch (error) {
        console.error('Legacy copy failed:', error);
        return { success: false, error };
    }
}

// Open web version of assistant
function openAssistantWeb(query, assistant) {
    try {
        // Import assistant URL builder
        if (typeof window.buildAssistantWebUrl === 'function') {
            const url = window.buildAssistantWebUrl(assistant, query);
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            // Check if popup was blocked
            setTimeout(() => {
                try {
                    if (!newWindow || newWindow.closed || !newWindow.location || newWindow.location.href === 'about:blank') {
                        throw new Error('Popup blocked');
                    }
                } catch (e) {
                    // Cross-origin error is expected and means window opened successfully
                }
            }, 100);
            
            return { success: true };
        } else {
            throw new Error('Assistant URL builder not available');
        }
    } catch (error) {
        console.error('Failed to open assistant web version:', error);
        return { success: false, error };
    }
}

// Show toast message
function showToast(message, duration = CONFIG.TOAST_DURATION_MS) {
    // Find existing toast or create new one
    let toast = document.getElementById('aiSuccessMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'aiSuccessMessage';
        toast.className = 'ai-success-message';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Track analytics events
function trackAnalyticsEvent(eventName, eventData = {}) {
    try {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'AI Share Mobile',
                ...eventData
            });
        }
        
        // GTM DataLayer
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                event: eventName,
                ...eventData
            });
        }
        
        console.log('AI Share Analytics:', eventName, eventData);
    } catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
}

// Main share flow orchestrator
async function runAiShareFlow({ assistant, productTitle, productUrl, promptText }) {
    const isMobile = detect.isMobile;
    const canShare = canWebShare();
    
    // Track button click
    trackAnalyticsEvent('button_click', { assistant });
    
    // Always copy if configured
    if (CONFIG.COPY_ALWAYS) {
        try {
            await copyToClipboard(promptText, productUrl);
            trackAnalyticsEvent('copy_success', { isMobile });
        } catch (error) {
            console.warn('Copy failed but continuing with flow:', error);
            trackAnalyticsEvent('copy_error', { isMobile, message: error.message });
        }
    }
    
    // Mobile flow with Web Share API
    if (isMobile && CONFIG.MOBILE_SHARE_FLOW && canShare) {
        const sharePayload = buildSharePayload({ productTitle, productUrl, promptText });
        
        trackAnalyticsEvent('share_open', { 
            isMobile: true, 
            title: sharePayload.title 
        });
        
        const shareResult = await sharePrompt(sharePayload);
        
        if (shareResult.success) {
            trackAnalyticsEvent('share_success', { isMobile: true });
            showToast('Text je ve schránce – vlož ho do AI a odešli.');
            return { success: true, method: 'share' };
        } else {
            // Share failed or was cancelled - fallback to web assistant
            if (shareResult.cancelled) {
                trackAnalyticsEvent('share_error', { 
                    isMobile: true, 
                    message: 'User cancelled' 
                });
            } else {
                trackAnalyticsEvent('share_error', { 
                    isMobile: true, 
                    message: shareResult.error?.message 
                });
            }
            
            // Fallback to web assistant
            trackAnalyticsEvent('fallback_copy_triggered', { isMobile: true });
            const webResult = openAssistantWeb(promptText, assistant);
            
            if (webResult.success) {
                trackAnalyticsEvent('web_assistant_open', { assistant });
                showToast('Text je ve schránce – vlož ho do AI a odešli.');
                return { success: true, method: 'web_fallback' };
            } else {
                showToast('Chyba při otevírání AI asistenta.');
                return { success: false, error: 'Web fallback failed' };
            }
        }
    }
    
    // Desktop flow or mobile without Web Share API
    else {
        if (CONFIG.DESKTOP_DEEPLINK_FLOW) {
            const webResult = openAssistantWeb(promptText, assistant);
            
            if (webResult.success) {
                if (isMobile) {
                    trackAnalyticsEvent('web_assistant_open', { assistant });
                } else {
                    trackAnalyticsEvent('desktop_deeplink_open', { assistant });
                }
                showToast('Text je ve schránce – vlož ho do AI a odešli.');
                return { success: true, method: 'web' };
            } else {
                showToast('Chyba při otevírání AI asistenta.');
                return { success: false, error: 'Web open failed' };
            }
        } else {
            // Copy-only flow
            showToast('Text je ve schránce – vlož ho do AI a odešli.');
            return { success: true, method: 'copy_only' };
        }
    }
}

// Update configuration
function updateConfig(newConfig) {
    CONFIG = { ...CONFIG, ...newConfig };
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.shareFlow = {
        detect,
        canWebShare,
        buildSharePayload,
        sharePrompt,
        copyToClipboard,
        openAssistantWeb,
        runAiShareFlow,
        updateConfig,
        CONFIG,
        DEFAULT_CONFIG
    };
}