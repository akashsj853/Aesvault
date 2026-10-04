/**
 * AESVault File Encryption Logic
 * Handles drag & drop, 256-bit key generation, copy/download, and progress animation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const dropzonePrompt = document.getElementById('dropzonePrompt');
    const filePreview = document.getElementById('filePreview');
    const previewFilename = document.getElementById('previewFilename');
    const previewFilesize = document.getElementById('previewFilesize');
    const previewFiletype = document.getElementById('previewFiletype');
    const removeFileBtn = document.getElementById('removeFileBtn');

    const btnGenerateKey = document.getElementById('btnGenerateKey');
    const aesKeyInput = document.getElementById('aesKeyInput');
    const btnToggleKey = document.getElementById('btnToggleKeyVisibility');
    const btnCopyKey = document.getElementById('btnCopyKey');
    const btnDownloadKey = document.getElementById('btnDownloadKey');

    const encryptForm = document.getElementById('encryptForm');
    const progressBox = document.getElementById('progressBox');
    const progressBarFill = document.getElementById('progressBarFill');
    const btnSubmit = document.getElementById('btnSubmitEncrypt');

    // -------------------------------------------------------------
    // Drag & Drop Handlers
    // -------------------------------------------------------------
    if (dropzone && fileInput) {
        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFilePreview(files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                updateFilePreview(fileInput.files[0]);
            }
        });

        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.value = '';
                dropzonePrompt.style.display = 'block';
                filePreview.style.display = 'none';
            });
        }
    }

    function updateFilePreview(file) {
        if (!file) return;
        previewFilename.textContent = file.name;
        
        let sizeStr = '';
        if (file.size > 1048576) {
            sizeStr = (file.size / 1048576).toFixed(2) + ' MB';
        } else if (file.size > 1024) {
            sizeStr = (file.size / 1024).toFixed(1) + ' KB';
        } else {
            sizeStr = file.size + ' B';
        }
        previewFilesize.textContent = sizeStr;
        previewFiletype.textContent = file.type || 'Binary File';

        dropzonePrompt.style.display = 'none';
        filePreview.style.display = 'flex';
    }

    // -------------------------------------------------------------
    // Key Generation & Handling
    // -------------------------------------------------------------
    if (btnGenerateKey && aesKeyInput) {
        btnGenerateKey.addEventListener('click', async () => {
            try {
                // Request cryptographically secure key from backend or generate locally
                const res = await fetch('/api/generate-key');
                if (res.ok) {
                    const data = await res.json();
                    aesKeyInput.value = data.key;
                    aesKeyInput.type = 'text';
                    if (btnToggleKey) btnToggleKey.textContent = '🙈';
                } else {
                    fallbackKeyGen();
                }
            } catch (err) {
                fallbackKeyGen();
            }
        });
    }

    function fallbackKeyGen() {
        const randomBytes = new Uint8Array(32);
        window.crypto.getRandomValues(randomBytes);
        let binary = '';
        for (let i = 0; i < randomBytes.byteLength; i++) {
            binary += String.fromCharCode(randomBytes[i]);
        }
        const b64 = window.btoa(binary);
        aesKeyInput.value = b64;
        aesKeyInput.type = 'text';
        if (btnToggleKey) btnToggleKey.textContent = '🙈';
    }

    if (btnToggleKey && aesKeyInput) {
        btnToggleKey.addEventListener('click', () => {
            if (aesKeyInput.type === 'password') {
                aesKeyInput.type = 'text';
                btnToggleKey.textContent = '🙈';
            } else {
                aesKeyInput.type = 'password';
                btnToggleKey.textContent = '👁️';
            }
        });
    }

    if (btnCopyKey && aesKeyInput) {
        btnCopyKey.addEventListener('click', () => {
            if (!aesKeyInput.value) {
                alert("Please generate or enter a key first.");
                return;
            }
            navigator.clipboard.writeText(aesKeyInput.value).then(() => {
                const orig = btnCopyKey.textContent;
                btnCopyKey.textContent = '✓ Copied!';
                setTimeout(() => { btnCopyKey.textContent = orig; }, 2000);
            });
        });
    }

    if (btnDownloadKey && aesKeyInput) {
        btnDownloadKey.addEventListener('click', () => {
            if (!aesKeyInput.value) {
                alert("Please generate or enter an AES key first.");
                return;
            }
            const blob = new Blob([aesKeyInput.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aesvault_secret_${Date.now()}.key`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // -------------------------------------------------------------
    // Submit with Progress Sequence
    // -------------------------------------------------------------
    if (encryptForm) {
        encryptForm.addEventListener('submit', (e) => {
            if (!fileInput.files.length) {
                e.preventDefault();
                alert("Please select a file to encrypt.");
                return;
            }
            if (!aesKeyInput.value.trim()) {
                e.preventDefault();
                alert("Please generate or enter an AES key.");
                return;
            }

            // Show live progress UI
            progressBox.style.display = 'block';
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Encrypting File...';

            animateSteps();
        });
    }

    function animateSteps() {
        const steps = [
            { id: 'step1', pct: 20 },
            { id: 'step2', pct: 45 },
            { id: 'step3', pct: 75 },
            { id: 'step4', pct: 95 },
            { id: 'step5', pct: 100 }
        ];

        let current = 0;
        const interval = setInterval(() => {
            if (current < steps.length) {
                const s = steps[current];
                const el = document.getElementById(s.id);
                if (el) {
                    el.className = 'step-done';
                    el.querySelector('.step-status').textContent = '✓';
                }
                progressBarFill.style.width = s.pct + '%';
                current++;
            } else {
                clearInterval(interval);
            }
        }, 180);
    }
});
