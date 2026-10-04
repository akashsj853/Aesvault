/**
 * AESVault Educational Visualizer Script
 * Demonstrates real AES-256-GCM encryption and decryption steps.
 */

document.addEventListener('DOMContentLoaded', () => {
    const visInputText = document.getElementById('visInputText');
    const btnVisEncrypt = document.getElementById('btnVisEncrypt');
    const btnVisNewKey = document.getElementById('btnVisNewKey');
    const btnVisDecrypt = document.getElementById('btnVisDecrypt');

    const visKeyHex = document.getElementById('visKeyHex');
    const visNonceHex = document.getElementById('visNonceHex');
    const visCipherHex = document.getElementById('visCipherHex');
    const visTagBreakdown = document.getElementById('visTagBreakdown');

    const visDecryptSection = document.getElementById('visDecryptSection');
    const visBoxDecrypted = document.getElementById('visBoxDecrypted');
    const visDecryptedText = document.getElementById('visDecryptedText');

    let currentKeyB64 = '';
    let currentNonceB64 = '';
    let currentCiphertextB64 = '';

    // Generate Initial Key
    generateFreshKey();

    if (btnVisNewKey) {
        btnVisNewKey.addEventListener('click', generateFreshKey);
    }

    async function generateFreshKey() {
        try {
            const res = await fetch('/api/generate-key');
            if (res.ok) {
                const data = await res.json();
                currentKeyB64 = data.key;
            } else {
                generateLocalKey();
            }
        } catch {
            generateLocalKey();
        }
    }

    function generateLocalKey() {
        const rand = new Uint8Array(32);
        window.crypto.getRandomValues(rand);
        let bin = '';
        for (let i = 0; i < rand.byteLength; i++) {
            bin += String.fromCharCode(rand[i]);
        }
        currentKeyB64 = window.btoa(bin);
    }

    if (btnVisEncrypt) {
        btnVisEncrypt.addEventListener('click', async () => {
            const text = visInputText.value.trim() || 'Hello AESVault';
            if (!currentKeyB64) generateLocalKey();

            try {
                btnVisEncrypt.disabled = true;
                btnVisEncrypt.textContent = 'Encrypting...';

                const response = await fetch('/api/visualize-aes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plaintext: text, key: currentKeyB64 })
                });

                if (response.ok) {
                    const data = await response.json();
                    renderVisualization(data.result);
                } else {
                    await clientSideAESGCM(text);
                }
            } catch {
                await clientSideAESGCM(text);
            } finally {
                btnVisEncrypt.disabled = false;
                btnVisEncrypt.textContent = '⚡ Step 1: Encrypt Plaintext →';
            }
        });
    }

    function renderVisualization(res) {
        currentKeyB64 = res.key_b64;
        currentNonceB64 = res.nonce_b64;
        currentCiphertextB64 = res.combined_b64;

        visKeyHex.textContent = res.key_hex.toUpperCase();
        visNonceHex.textContent = `${res.nonce_hex.toUpperCase()} (12-byte vector)`;
        visCipherHex.textContent = res.combined_hex.toUpperCase();

        visTagBreakdown.innerHTML = `
            <small style="color: #94A3B8; font-family: monospace; display: block; margin-top: 0.5rem;">
                Ciphertext bytes: ${res.pure_ciphertext_hex.toUpperCase()}<br>
                GMAC Auth Tag (16 bytes): <span style="color: #22C55E;">${res.auth_tag_hex.toUpperCase()}</span>
            </small>
        `;

        visDecryptSection.style.display = 'block';
        visBoxDecrypted.style.display = 'none';
    }

    if (btnVisDecrypt) {
        btnVisDecrypt.addEventListener('click', async () => {
            try {
                btnVisDecrypt.disabled = true;
                btnVisDecrypt.textContent = 'Decrypting & Authenticating...';

                const response = await fetch('/api/visualize-decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ciphertext: currentCiphertextB64,
                        nonce: currentNonceB64,
                        key: currentKeyB64
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    visDecryptedText.textContent = data.plaintext;
                    visBoxDecrypted.style.display = 'block';
                }
            } catch (err) {
                alert("Decryption failed. Authentication tag mismatch.");
            } finally {
                btnVisDecrypt.disabled = false;
                btnVisDecrypt.textContent = '🔓 Step 2: Decrypt Ciphertext & Verify Tag →';
            }
        });
    }

    // Client-side Web Crypto standard AES-GCM fallback
    async function clientSideAESGCM(text) {
        const rawKey = Uint8Array.from(atob(currentKeyB64), c => c.charCodeAt(0));
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
        );
        const nonce = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedText = new TextEncoder().encode(text);

        const ciphertextBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: nonce }, cryptoKey, encodedText
        );

        const cipherArray = new Uint8Array(ciphertextBuffer);
        const hex = Array.from(cipherArray).map(b => b.toString(16).padStart(2, '0')).join('');
        const nonceHex = Array.from(nonce).map(b => b.toString(16).padStart(2, '0')).join('');

        currentNonceB64 = btoa(String.fromCharCode.apply(null, Array.from(nonce)));
        currentCiphertextB64 = btoa(String.fromCharCode.apply(null, Array.from(cipherArray)));

        renderVisualization({
            key_b64: currentKeyB64,
            key_hex: Array.from(rawKey).map(b => b.toString(16).padStart(2, '0')).join(''),
            nonce_b64: currentNonceB64,
            nonce_hex: nonceHex,
            combined_b64: currentCiphertextB64,
            combined_hex: hex,
            pure_ciphertext_hex: hex.slice(0, -32),
            auth_tag_hex: hex.slice(-32)
        });
    }
});
