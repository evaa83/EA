function setupImmersiveExperience(prefix, cues) {
    const launch = document.getElementById(prefix + 'ExperienceLaunch');
    if (!launch) return;
    const dialog = document.getElementById(prefix + 'Experience');
    const video = document.getElementById(prefix + 'ExperienceVideo');
    const caption = document.getElementById(prefix + 'InnerVoice');
    const end = document.getElementById(prefix + 'ExperienceEnd');
    const pause = document.getElementById(prefix + 'Pause');
    const reflection = document.getElementById(prefix + 'Reflection');
    let enteredFullscreen = false;
    function updateCaption() {
        const cue = cues.find(c => video.currentTime >= c.start && video.currentTime < c.end);
        const text = cue ? cue.text : '';
        if (caption.textContent !== text) caption.textContent = text;
    }
    function replay() {
        end.hidden = true;
        video.currentTime = 0;
        caption.textContent = '';
        video.play().catch(() => { pause.textContent = '播放'; pause.setAttribute('aria-label', '播放影片'); });
    }
    async function close() {
        video.pause();
        enteredFullscreen = false;
        if (document.fullscreenElement === dialog && document.exitFullscreen) {
            try { await document.exitFullscreen(); } catch (_) { /* The dialog still closes. */ }
        }
        if (document.webkitFullscreenElement === dialog && document.webkitExitFullscreen) document.webkitExitFullscreen();
        if (dialog.open) dialog.close();
        reflection.hidden = false;
        document.getElementById(prefix + 'Invitation').hidden = true;
        reflection.focus({ preventScroll: true });
        reflection.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    launch.addEventListener('click', () => {
        document.querySelectorAll('.video-player').forEach(v => v.pause());
        dialog.showModal();
        // Request fullscreen within the click gesture; a full-window dialog remains if unavailable.
        try {
            const request = dialog.requestFullscreen ? dialog.requestFullscreen() : dialog.webkitRequestFullscreen?.();
            if (request?.catch) request.catch(() => {});
        } catch (_) { /* Full-window dialog is available in browsers without fullscreen support. */ }
        replay();
    });
    for (const event of ['timeupdate', 'seeking', 'seeked']) video.addEventListener(event, updateCaption);
    // Loop continuously; timeupdate resets the inner voice when the video wraps to zero.
    video.loop = true;
    video.addEventListener('play', () => { pause.textContent = '暫停'; pause.setAttribute('aria-label', '暫停影片'); });
    video.addEventListener('pause', () => { pause.textContent = '播放'; pause.setAttribute('aria-label', '播放影片'); });
    const sound = document.getElementById(prefix + 'Sound');
    sound.addEventListener('click', () => {
        video.muted = !video.muted;
        sound.textContent = video.muted ? '開啟聲音' : '靜音';
        sound.setAttribute('aria-label', video.muted ? '開啟聲音' : '關閉聲音');
        sound.setAttribute('aria-pressed', String(video.muted));
    });
    pause.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
    document.getElementById(prefix + 'Replay').addEventListener('click', replay);
    document.getElementById(prefix + 'Exit').addEventListener('click', close);
    document.getElementById(prefix + 'Return').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    function onFullscreenChange() {
        const active = document.fullscreenElement === dialog || document.webkitFullscreenElement === dialog;
        if (active) enteredFullscreen = true;
        else if (enteredFullscreen && dialog.open) close();
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    dialog.addEventListener('keydown', event => {
        if (event.key === ' ' && event.target === dialog) { event.preventDefault(); pause.click(); }
    });
}
setupImmersiveExperience('train', [
    { start: 3, end: 4, text: '等等……' },
    { start: 4, end: 6.5, text: '我出門前……是不是沒關爐火？' },
    { start: 6.5, end: 10, text: '火車已經開了……\n現在怎麼辦？' }
]);
setupImmersiveExperience('traffic', [
    { start: 2.2, end: 4.3, text: '後面是在按我嗎？' },
    { start: 4.3, end: 7, text: '前面都堵住了……\n我也沒辦法往前啊。' },
    { start: 7, end: 10, text: '怎麼還一直按……' }
]);
