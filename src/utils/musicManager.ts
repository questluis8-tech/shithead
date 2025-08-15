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

  private createElectronicChord(frequencies: number[], startTime: number, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    frequencies.forEach((freq, index) => {
      // Main oscillator
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      // Create a bright, electronic tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Add slight detuning for richness
      const detune = (Math.random() - 0.5) * 5;
      osc.detune.setValueAtTime(detune, startTime);
      
      // Sharp attack, sustained release for electronic feel
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.2 / frequencies.length, startTime + 0.05);
      oscGain.gain.setValueAtTime(0.2 / frequencies.length, startTime + duration - 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      this.oscillators.push(osc);
      
      // Add harmonic for electronic richness
      const harmonic = this.audioContext!.createOscillator();
      const harmonicGain = this.audioContext!.createGain();
      
      harmonic.type = 'square';
      harmonic.frequency.setValueAtTime(freq * 2, startTime);
      
      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.linearRampToValueAtTime(0.05 / frequencies.length, startTime + 0.05);
      harmonicGain.gain.setValueAtTime(0.05 / frequencies.length, startTime + duration - 0.1);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(this.gainNode!);
      
      harmonic.start(startTime);
      harmonic.stop(startTime + duration);
      
      this.oscillators.push(harmonic);
    });
  }

  private playElectronicProgression() {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const chordDuration = 2; // 2 seconds per chord for more energy
    
    // Electronic chord progression in A minor (energetic)
    const chords = [
      [220.00, 277.18, 329.63], // A minor
      [246.94, 311.13, 369.99], // F major
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // G major
    ];
    
    chords.forEach((chord, index) => {
      const startTime = currentTime + (index * chordDuration);
      this.createElectronicChord(chord, startTime, chordDuration * 0.8);
    });
    
    // Schedule next progression
    setTimeout(() => {
      if (this.isPlaying) {
        this.playElectronicProgression();
      }
    }, chordDuration * chords.length * 1000);
  }

  private addElectronicBeats() {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatInterval = 0.375; // 160 BPM - more energetic
    
    // Electronic kick and snare pattern
    for (let i = 0; i < 16; i++) {
      const beatTime = currentTime + (i * beatInterval);
      
      if (i % 4 === 0) {
        // Electronic kick (punchy low frequency)
        this.createElectronicDrumHit(80, beatTime, 0.15, 'sine');
      } else if (i % 4 === 2) {
        // Electronic snare (bright and sharp)
        this.createElectronicDrumHit(400, beatTime, 0.08, 'square');
      }
      
      // Electronic hi-hat (crisp and frequent)
      if (i % 2 === 1) {
        this.createElectronicDrumHit(12000, beatTime, 0.03, 'sawtooth');
      }
    }
    
    // Schedule next drum pattern
    setTimeout(() => {
      if (this.isPlaying) {
        this.addElectronicBeats();
      }
    }, 16 * beatInterval * 1000);
  }

  private createElectronicDrumHit(frequency: number, startTime: number, duration: number, type: OscillatorType) {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    
    // Sharp attack and quick decay for electronic drums
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
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
      
      // Start the electronic progression
      this.playElectronicProgression();
      
      // Start beats with slight delay
      setTimeout(() => {
        if (this.isPlaying) {
          this.addElectronicBeats();
        }
      }, 1000);
      
    } catch (error) {
      console.warn('Could not start electronic music:', error);
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