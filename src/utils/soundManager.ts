class SoundManager {
  private enabled: boolean = true;
  
  private playSound(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }
  
  cardPlay(): void {
    // Quick snap sound for playing cards
    this.playSound(800, 0.08, 'triangle');
    setTimeout(() => this.playSound(600, 0.06, 'sine'), 30);
  }
  
  cardDeal(): void {
    // Soft whoosh for dealing
    this.playSound(400, 0.12, 'sine');
  }
  
  cardShuffle(): void {
    // Multiple quick sounds for shuffle effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playSound(200 + Math.random() * 100, 0.05, 'sawtooth');
      }, i * 50);
    }
  }
  
  cardPickup(): void {
    // Disappointed pickup sound
    this.playSound(300, 0.15, 'sine');
    setTimeout(() => this.playSound(250, 0.2, 'triangle'), 80);
    setTimeout(() => this.playSound(200, 0.25, 'sine'), 160);
  }
  
  cardBurn(): void {
    // Explosive burn sound
    this.playSound(150, 0.1, 'sawtooth');
    setTimeout(() => this.playSound(200, 0.15, 'square'), 50);
    setTimeout(() => this.playSound(300, 0.2, 'triangle'), 100);
    setTimeout(() => this.playSound(400, 0.1, 'sine'), 200);
  }
  
  gameWin(): void {
    // Victory fanfare
    const notes = [523, 659, 783, 1047]; // C, E, G, C octave
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playSound(note, 0.3, 'triangle');
      }, index * 150);
    });
  }
  
  gameLose(): void {
    // Descending sad sound
    const notes = [440, 392, 349, 294]; // A, G, F, D
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playSound(note, 0.2, 'sine');
      }, index * 100);
    });
  }
  
  toggle(): void {
    this.enabled = !this.enabled;
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();