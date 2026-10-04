/**
 * AESVault File Decryption Logic
 * Validates .enc extension, key input, clipboard paste, and form submission.
 */

document.addEventListener('DOMContentLoaded', () => {
    const decryptDropzone = document.getElementById('decryptDropzone');
    const decryptFileInput = document.getElementById('decryptFileInput');
    const decryptDropzonePrompt = document.getElementById('decryptDropzonePrompt');
    const decryptFilePreview = document.getElementById('decryptFilePreview');
    const decryptFilename = document.getElementById('decryptFilename');
    const decryptFilesize = document.getElementById('decryptFilesize');
    const decryptRemoveBtn = document.getElementById('decryptRemoveBtn');

    const decryptKeyInput = document.getElementById('decryptKeyInput');
    const btnToggleDecryptKey = document.getElementById('btnToggleDecryptKey');
    const btnPasteKey = document.getElementById('btnPasteKey');
    const decryptForm = document.getElementById('decryptForm');
    const btnSubmit = document.getElementById('btnSubmitDecrypt');

    // Drag & Drop
    if (decryptDropzone && decryptFileInput) {
        ['dragenter', 'dragover'].forEach(evt => {
            decryptDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                decryptDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            decryptDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                decryptDropzone.classList.remove('dragover');
            });
        });

        decryptDropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                decryptFileInput.files = files;
                updatePreview(files[0]);
            }
        });

        decryptFileInput.addEventListener('change', () => {
            if (decryptFileInput.files.length > 0) {
                updatePreview(decryptFileInput.files[0]);
            }
        });

        if (decryptRemoveBtn) {
            decryptRemoveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                decryptFileInput.value = '';
                decryptDropzonePrompt.style.display = 'block';
                decryptFilePreview.style.display = 'none';
            });
        }
    }

    function updatePreview(file) {
        if (!file) return;
        decryptFilename.textContent = file.name;
        
        let sizeStr = '';
        if (file.size > 1048576) {
            sizeStr = (file.size / 1048576).toFixed(2) + ' MB';
        } else if (file.size > 1024) {
            sizeStr = (file.size / 1024).toFixed(1) + ' KB';
        } else {
            sizeStr = file.size + ' B';
        }
        decryptFilesize.textContent = sizeStr;

        decryptDropzonePrompt.style.display = 'none';
        decryptFilePreview.style.display = 'flex';
    }

    // Toggle Visibility
    if (btnToggleDecryptKey && decryptKeyInput) {
        btnToggleDecryptKey.addEventListener('click', () => {
            if (decryptKeyInput.type === 'password') {
                decryptKeyInput.type = 'text';
                btnToggleDecryptKey.textContent = '🙈';
            } else {
                decryptKeyInput.type = 'password';
                btnToggleDecryptKey.textContent = '👁️';
            }
        });
    }

    // Paste Key from Clipboard
    if (btnPasteKey && decryptKeyInput) {
        btnPasteKey.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    decryptKeyInput.value = text.trim();
                    const orig = btnPasteKey.textContent;
                    btnPasteKey.textContent = '✓ Pasted!';
                    setTimeout(() => { btnPasteKey.textContent = orig; }, 1500);
                }
            } catch (err) {
                alert("Please manually paste your key into the text field.");
            }
        });
    }

    if (decryptForm) {
        decryptForm.addEventListener('submit', (e) => {
            if (!decryptFileInput.files.length) {
                e.preventDefault();
                alert("Please select an encrypted (.enc) file.");
                return;
            }
            if (!decryptKeyInput.value.trim()) {
                e.preventDefault();
                alert("Please enter the AES key.");
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Verifying Integrity & Decrypting...';
        });
    }
});
