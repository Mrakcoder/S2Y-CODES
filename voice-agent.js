(() => {
    const pages = {
        home: 'index.html',
        mission: 'mission.html',
        papers: 'question-papers.html',
        ssb: 'ssb-journey.html',
        models: '3d-models.html'
    };

    const widget = `
        <aside class="voice-widget-container" aria-label="Shishya2Yoddha voice assistant">
            <section class="voice-panel hidden" id="s2yVoicePanel" aria-live="polite" aria-label="Shishya2Yoddha assistant">
                <header class="voice-header">
                    <div><strong>Shishya2Yoddha</strong><br><small>Calm guidance, focused path</small></div>
                    <button class="close-btn" type="button" aria-label="Close assistant">&times;</button>
                </header>
                <div class="voice-body">
                    <p class="voice-status-text">Ask about papers, resources, or a page</p>
                    <div class="audio-wave" aria-hidden="true"><i class="wave-bar"></i><i class="wave-bar"></i><i class="wave-bar"></i><i class="wave-bar"></i><i class="wave-bar"></i></div>
                    <p class="voice-transcript" id="s2yTranscript">Namaste. How may I guide you?</p>
                    <div class="voice-actions">
                        <button type="button" class="voice-listen-btn" id="s2yListen">🎙 Speak</button>
                        <button type="button" class="voice-stop-btn" id="s2yStop">Stop</button>
                    </div>
                </div>
                <footer class="voice-footer"><small>Try: “Question papers kahan hain?”</small></footer>
            </section>
            <button class="voice-trigger-btn" id="s2yVoiceTrigger" type="button" aria-expanded="false" aria-controls="s2yVoicePanel" aria-label="Open Shishya2Yoddha voice assistant">🎙</button>
        </aside>`;

    const normalize = value => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const route = query => {
        const raw = query.toLowerCase();
        const q = normalize(query);
        if (/question|paper|pdf|nda|cds|afcat|upsc|exam|download|resource|notes|document|study/.test(q) || /प्रश्न|पेपर|पीडीएफ|संसाधन|नोट्स|पढ़ाई|अध्ययन/.test(raw))
            return { page: pages.papers, text: 'Bilkul. I am taking you to the Question Papers page, where you can find NDA, CDS and other study resources.' };
        if (/ssb|interview|personality|olq|journey|assessment/.test(q) || /इंटरव्यू|व्यक्तित्व|यात्रा/.test(raw))
            return { page: pages.ssb, text: 'I will guide you to the SSB Journey page for preparation and assessment resources.' };
        if (/3d|model|aircraft|vehicle|visual/.test(q) || /मॉडल|विमान/.test(raw))
            return { page: pages.models, text: 'Opening the 3D Models page for you.' };
        if (/mission|about|purpose|vision|who are you|shishya/.test(q) || /मिशन|उद्देश्य|जानकारी/.test(raw))
            return { page: pages.mission, text: 'Let us visit the Mission page to learn about Shishya2Yoddha.' };
        if (/home|start|main page|homepage/.test(q) || /होम|मुख्य पृष्ठ/.test(raw))
            return { page: pages.home, text: 'Taking you to the home page. Stay focused, Yoddha.' };
        return { text: ' Jai Hind        I can guide you to Question Papers, SSB Journey, 3D Models, Mission, or Home. Please say the page or resource you need.' };
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', widget);
        const panel = document.getElementById('s2yVoicePanel');
        const trigger = document.getElementById('s2yVoiceTrigger');
        const transcript = document.getElementById('s2yTranscript');
        const listen = document.getElementById('s2yListen');
        const stop = document.getElementById('s2yStop');
        const close = panel.querySelector('.close-btn');
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition;

        const say = text => {
            transcript.textContent = text;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
            window.speechSynthesis.speak(utterance);
        };
        const setOpen = open => {
            panel.classList.toggle('hidden', !open);
            trigger.setAttribute('aria-expanded', String(open));
            if (open) trigger.blur();
        };
        const answer = query => {
            const result = route(query);
            say(result.text);
            if (result.page) window.setTimeout(() => { window.location.href = result.page; }, 9400);
        };
        trigger.addEventListener('click', () => setOpen(panel.classList.contains('hidden')));
        close.addEventListener('click', () => setOpen(false));
        stop.addEventListener('click', () => { window.speechSynthesis.cancel(); if (recognition) recognition.stop(); panel.classList.remove('listening'); });
        if (!Recognition) {
            listen.disabled = true;
            listen.textContent = 'Voice unavailable';
            listen.title = 'Use a browser with speech recognition support, such as Chrome or Edge.';
            return;
        }
        recognition = new Recognition();
        recognition.lang = navigator.language && navigator.language.startsWith('hi') ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        listen.addEventListener('click', () => {
            window.speechSynthesis.cancel();
            transcript.textContent = 'Listening… ask for the page or resource you need.';
            panel.classList.add('listening');
            recognition.start();
        });
        recognition.addEventListener('result', event => {
            panel.classList.remove('listening');
            const query = event.results[0][0].transcript;
            transcript.textContent = `You said: “${query}”`;
            window.setTimeout(() => answer(query), 450);
        });
        recognition.addEventListener('end', () => panel.classList.remove('listening'));
        recognition.addEventListener('error', event => {
            panel.classList.remove('listening');
            transcript.textContent = event.error === 'not-allowed' ? 'Microphone permission is needed to listen.' : 'I could not hear that. Please try again.';
        });
    });
})();
