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

  private createJazzChord(frequencies: number[], startTime: number, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    frequencies.forEach((freq, index) => {
      // Main jazz chord tone
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      // Warm jazz tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Add slight detuning for jazz warmth
      const detune = (Math.random() - 0.5) * 3;
      osc.detune.setValueAtTime(detune, startTime);
      
      // Smooth jazz envelope - gentle attack and release
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.15 / frequencies.length, startTime + 0.2);
      oscGain.gain.setValueAtTime(0.15 / frequencies.length, startTime + duration - 0.5);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      this.oscillators.push(osc);
      
      // Add subtle triangle wave for jazz warmth
      const warmth = this.audioContext!.createOscillator();
      const warmthGain = this.audioContext!.createGain();
      
      warmth.type = 'triangle';
      warmth.frequency.setValueAtTime(freq * 0.5, startTime); // Sub-harmonic for bass warmth
      
      warmthGain.gain.setValueAtTime(0, startTime);
      warmthGain.gain.linearRampToValueAtTime(0.08 / frequencies.length, startTime + 0.3);
      warmthGain.gain.setValueAtTime(0.08 / frequencies.length, startTime + duration - 0.5);
      warmthGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      warmth.connect(warmthGain);
      warmthGain.connect(this.gainNode!);
      
      warmth.start(startTime);
      warmth.stop(startTime + duration);
      
      this.oscillators.push(warmth);
    });
  }

  private playJazzProgression() {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const chordDuration = 4; // 4 seconds per chord for smooth jazz feel
    
    // Sophisticated jazz chord progression (ii-V-I-vi in C major)
    const chords = [
      [146.83, 174.61, 220.00, 261.63], // Dm7 (ii7)
      [196.00, 246.94, 293.66, 349.23], // G7 (V7)
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (Imaj7)
      [220.00, 261.63, 329.63, 392.00], // Am7 (vi7)
    ];
    
    chords.forEach((chord, index) => {
      const startTime = currentTime + (index * chordDuration);
      this.createJazzChord(chord, startTime, chordDuration * 0.9);
    });
    
    // Schedule next progression
    setTimeout(() => {
      if (this.isPlaying) {
        this.playJazzProgression();
      }
    }, chordDuration * chords.length * 1000);
  }

  private addJazzRhythm() {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatInterval = 0.5; // 120 BPM - smooth jazz tempo
    
    // Subtle jazz rhythm pattern
    for (let i = 0; i < 32; i++) {
      const beatTime = currentTime + (i * beatInterval);
      
      if (i % 8 === 0) {
        // Soft jazz kick (warm and mellow)
        this.createJazzDrumHit(60, beatTime, 0.3, 'sine');
      } else if (i % 8 === 4) {
        // Gentle snare (brushed sound)
        this.createJazzDrumHit(200, beatTime, 0.15, 'triangle');
      }
      
      // Subtle hi-hat (soft and jazzy)
      if (i % 4 === 2) {
        this.createJazzDrumHit(8000, beatTime, 0.05, 'triangle');
      }
    }
    
    // Schedule next drum pattern
    setTimeout(() => {
      if (this.isPlaying) {
        this.addJazzRhythm();
      }
    }, 32 * beatInterval * 1000);
  }

  private createJazzDrumHit(frequency: number, startTime: number, duration: number, type: OscillatorType) {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    
    // Smooth attack and gentle decay for jazz drums
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
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
      
      // Start the jazz progression
      this.playJazzProgression();
      
      // Start jazz rhythm with slight delay
      setTimeout(() => {
        if (this.isPlaying) {
          this.addJazzRhythm();
        }
      }, 2000);
      
    } catch (error) {
      console.warn('Could not start jazz music:', error);
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

  mute() {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
    }
  }
  
  unmute() {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext?.currentTime || 0);
    }
  }
  
  isMuted(): boolean {
    return this.gainNode ? this.gainNode.gain.value === 0 : false;
  }
  
  toggleMute() {
    if (this.isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
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