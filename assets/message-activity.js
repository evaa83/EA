(() => {
    const byId = id => document.getElementById(id);
    const boundary = byId('messageBoundary');
    const list = byId('messageRelayReview');
    const unsure = byId('messageBoundaryUnsure');
    function refresh() {
        byId('messageGuessEcho').textContent = byId('messageGuess').value.trim() || '（第一階段尚未填寫猜測）';
        list.replaceChildren();
        for (let i = 1; i <= 4; i++) {
            const text = byId('messageRelay_' + i).value.trim();
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'message-relay-choice';
            button.textContent = `第 ${i} 棒｜${text || '（尚未接龍）'}`;
            button.disabled = !text;
            button.setAttribute('aria-pressed', String(boundary.value === String(i)));
            button.addEventListener('click', () => {
                boundary.value = String(i);
                refresh();
                saveState();
            });
            list.appendChild(button);
        }
        unsure.setAttribute('aria-pressed', String(boundary.value === 'unsure'));
        byId('messageBoundaryStatus').textContent = boundary.value === 'unsure'
            ? '你們選擇先保留判斷，請在右側寫下理由。'
            : boundary.value ? `你們選擇第 ${boundary.value} 棒。這是討論的起點，請說明哪些內容尚未被確認。`
            : '點選一句，再說明你們的理由；不需要和其他組有相同答案。';
    }
    unsure.addEventListener('click', () => { boundary.value = 'unsure'; refresh(); saveState(); });
    window.refreshMessageActivity = refresh;
    window.addEventListener('load', refresh);
})();
