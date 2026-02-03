'use client';

import { useEffect } from 'react';

export function PiPEnabler() {
  useEffect(() => {
    // The function provided by the user, adapted for React's lifecycle
    async function enablePiPForYoutube() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');

        iframes.forEach(iframe => {
            // Check if the video has been processed already to avoid duplicates
            if (iframe.parentElement?.classList.contains('pip-wrapper')) return;

            // 1. Create a container for the video and the button
            const wrapper = document.createElement('div');
            wrapper.className = 'pip-wrapper';
            iframe.parentNode?.insertBefore(wrapper, iframe);
            wrapper.appendChild(iframe);

            // 2. Create the floating button
            const btn = document.createElement('button');
            btn.className = 'custom-pip-btn';
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="stroke-linecap: round; stroke-linejoin: round;">
                    <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4"></path>
                    <path d="M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" fill="currentColor"></path>
                </svg>
                تشغيل عائم
            `;

            // 3. Floating video playback logic
            btn.onclick = async () => {
                try {
                    // YouTube embedded videos prevent direct PiP control from outside the frame.
                    // So we use this to guide the user.
                    if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                    } else {
                        alert("لتفعيل الوضع العائم في فيديوهات يوتيوب المضمنة:\nانقر بزر الماوس الأيمن 'مرتين متتاليتين' على الفيديو واختر 'Picture-in-picture'");
                    }
                } catch (error) {
                    console.error("PiP failed:", error);
                }
            };

            wrapper.appendChild(btn);
        });
    }

    // Run on initial mount
    enablePiPForYoutube();

    // Observe the page for additionally loaded videos (e.g., lazy loading)
    const observer = new MutationObserver((mutations) => {
        let hasIframeAdded = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                 for (const node of Array.from(mutation.addedNodes)) {
                    // Check if the added node is an iframe or contains one
                    if (node.nodeName === 'IFRAME' && (node as HTMLIFrameElement).src.includes('youtube.com')) {
                        hasIframeAdded = true;
                        break;
                    }
                    if (typeof (node as HTMLElement).querySelector === 'function' && (node as HTMLElement).querySelector('iframe[src*="youtube.com"]')) {
                        hasIframeAdded = true;
                        break;
                    }
                }
            }
            if (hasIframeAdded) break;
        }

        if(hasIframeAdded) {
            // A delay can help ensure the iframe is fully in the DOM
            setTimeout(enablePiPForYoutube, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup on component unmount
    return () => observer.disconnect();
  }, []); // Empty dependency array ensures this runs only once

  return null;
}
