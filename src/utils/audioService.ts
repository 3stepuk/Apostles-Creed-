class AudioService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays an authentic warm sanctuary chime / cathedral bell tone
   */
  public playSanctuaryChime(type: 'success' | 'keystroke' | 'milestone' | 'error' = 'success') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'keystroke') {
      // Very soft tactile subtle click/woodblock tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (type === 'error') {
      // Soft low amber tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(196, now); // G3
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      return;
    }

    // Sacred Cathedral Bell Harmonics (Fundamental + Tierce + Quint + Octave)
    const baseFreq = type === 'milestone' ? 523.25 : 440; // C5 or A4
    const partials = [
      { ratio: 1.0, gainVal: 0.18, decay: 1.8 },
      { ratio: 1.19, gainVal: 0.12, decay: 1.4 },  // Minor third
      { ratio: 1.5, gainVal: 0.10, decay: 1.2 },   // Fifth
      { ratio: 2.0, gainVal: 0.08, decay: 0.9 },   // Octave
      { ratio: 2.76, gainVal: 0.04, decay: 0.5 }   // Higher harmonic
    ];

    partials.forEach(({ ratio, gainVal, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVal * (type === 'milestone' ? 1.3 : 1.0), now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Recites text with native Web Speech API
   */
  public speakText(
    text: string, 
    lang: 'en' | 'la' = 'en', 
    rate: number = 0.9,
    onWord?: (wordIndex: number, charIndex: number) => void,
    onEnd?: () => void
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'la' ? 'la-VA' : 'en-US';
    utterance.rate = rate; // 0.85 - 1.0 for dignified, prayerful cadence
    utterance.pitch = 0.95;

    // Try to find a warm, natural voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (lang === 'la') {
        const latinVoice = voices.find(v => v.lang.startsWith('la') || v.lang.startsWith('it'));
        if (latinVoice) utterance.voice = latinVoice;
      } else {
        const prefVoice = voices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('Serena')) &&
          v.lang.startsWith('en')
        );
        if (prefVoice) utterance.voice = prefVoice;
      }
    }

    if (onWord) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onWord(0, event.charIndex);
        }
      };
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const audio = new AudioService();
