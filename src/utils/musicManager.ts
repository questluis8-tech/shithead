class MusicManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;
  private volume: number = 0.1;

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  private createLoFiChord(frequencies: number[], startTime: number, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    frequencies.forEach((freq, index) => {
      // Main oscillator
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      // Create a warm, mellow tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Add slight detuning for warmth
      const detune = (Math.random() - 0.5) * 10;
      osc.detune.setValueAtTime(detune, startTime);
      
      // Envelope for smooth attack and release
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.3 / frequencies.length, startTime + 0.1);
      oscGain.gain.setValueAtTime(0.3 / frequencies.length, startTime + duration - 0.2);
      oscGain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      this.oscillators.push(osc);
    });
  }

  private playLoFiProgression() {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const chordDuration = 4; // 4 seconds per chord
    
    // Lo-fi chord progression in C major (relaxing)
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 277.18, 329.63], // A minor
      [246.94, 311.13, 369.99], // F major
      [196.00, 246.94, 293.66], // G major
    ];
    
    chords.forEach((chord, index) => {
      const startTime = currentTime + (index * chordDuration);
      this.createLoFiChord(chord, startTime, chordDuration * 0.9);
    });
    
    // Schedule next progression
    setTimeout(() => {
      if (this.isPlaying) {
        this.playLoFiProgression();
      }
    }, chordDuration * chords.length * 1000);
  }

  private addLoFiDrums() {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatInterval = 0.5; // 120 BPM
    
    // Simple kick and snare pattern
    for (let i = 0; i < 16; i++) {
      const beatTime = currentTime + (i * beatInterval);
      
      if (i % 4 === 0) {
        // Kick drum (low frequency)
        this.createDrumHit(60, beatTime, 0.1, 'sine');
      } else if (i % 4 === 2) {
        // Snare (noise-like)
        this.createDrumHit(200, beatTime, 0.05, 'sawtooth');
      }
      
      // Hi-hat (subtle)
      if (Math.random() > 0.3) {
        this.createDrumHit(8000, beatTime, 0.02, 'square');
      }
    }
    
    // Schedule next drum pattern
    setTimeout(() => {
      if (this.isPlaying) {
        this.addLoFiDrums();
      }
    }, 16 * beatInterval * 1000);
  }

  private createDrumHit(frequency: number, startTime: number, duration: number, type: OscillatorType) {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    
    // Quick attack and decay for drum hit
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(oscGain);
    oscGain.connect(this.gainNode);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    this.oscillators.push(osc);
  }

  async start() {
    if (this.isPlaying) return;
    
    try {
      await this.initAudioContext();
      
      // Resume audio context if suspended (required by browsers)
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isPlaying = true;
      
      // Start the lo-fi progression
      this.playLoFiProgression();
      
      // Start drums with slight delay
      setTimeout(() => {
        if (this.isPlaying) {
          this.addLoFiDrums();
        }
      }, 2000);
      
    } catch (error) {
      console.warn('Could not start lo-fi music:', error);
    }
  }

  stop() {
    this.isPlaying = false;
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext?.currentTime || 0);
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isActive(): boolean {
    return this.isPlaying;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

export const musicManager = new MusicManager();