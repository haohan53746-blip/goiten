
class AudioService {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private melodyInterval: number | null = null;
  private oscillators: OscillatorNode[] = [];

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTick() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playStart() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const playPop = (freq: number, time: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.1, time + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    };

    playPop(440, now);
    playPop(554, now + 0.1);
    playPop(659, now + 0.2);
  }

  playWin() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.7);
    });
  }

  toggleBackgroundMusic() {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  private startBackgroundMusic() {
    const ctx = this.getContext();
    this.isMusicPlaying = true;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(0, ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);
    this.musicGain.connect(ctx.destination);

    this.playMelody();
  }

  private playMelody() {
    if (!this.isMusicPlaying) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Cheerful C Major Arpeggio
    const melody = [
      { f: 261.63, d: 0 },    // C4
      { f: 329.63, d: 0.25 }, // E4
      { f: 392.00, d: 0.5 },  // G4
      { f: 523.25, d: 0.75 }, // C5
      { f: 392.00, d: 1.0 },  // G4
      { f: 329.63, d: 1.25 }  // E4
    ];

    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.d);
      g.gain.setValueAtTime(0, now + note.d);
      g.gain.linearRampToValueAtTime(0.05, now + note.d + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + note.d + 0.4);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(now + note.d);
      osc.stop(now + note.d + 0.5);
      this.oscillators.push(osc);
    });

    this.melodyInterval = window.setTimeout(() => this.playMelody(), 1500);
  }

  private stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.melodyInterval) {
      clearTimeout(this.melodyInterval);
      this.melodyInterval = null;
    }
    if (this.musicGain) {
      const ctx = this.getContext();
      this.musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); } catch(e) {}
        });
        this.oscillators = [];
        this.musicGain?.disconnect();
        this.musicGain = null;
      }, 1000);
    }
  }
}

export const audioService = new AudioService();
