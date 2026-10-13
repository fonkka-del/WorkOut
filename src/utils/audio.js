// Web Audio API sound generator for workout timer and milestones
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(frequency = 587.33, type = 'sine', duration = 0.15) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback fails gracefully if muted or unsupported
    }
  }

  playTimerFinished() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [659.25, 880, 1046.5]; // E5, A5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'triangle', 0.25);
        }, idx * 150);
      });
    } catch {
      // graceful fallback
    }
  }

  playSetComplete() {
    try {
      this.playBeep(880, 'sine', 0.08);
    } catch {
      // graceful fallback
    }
  }

  playPRCelebration() {
    try {
      this.init();
      if (!this.ctx) return;
      const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      fanfare.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'sine', 0.18);
        }, idx * 100);
      });
    } catch {
      // graceful fallback
    }
  }
}

export const sound = new SoundEffects();
