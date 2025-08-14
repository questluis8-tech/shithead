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
    this.playSound(440, 0.1, 'triangle');
  }
  
  cardDeal(): void {
    this.playSound(330, 0.1, 'sine');
  }
  
  cardShuffle(): void {
    // Multiple quick sounds for shuffle effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playSound(200 + Math.random() * 100, 0.05, 'sawtooth');
      }, i * 50);
    }
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
  
  burn(): void {
    // Explosive sound
    this.playSound(100, 0.3, 'sawtooth');
    setTimeout(() => this.playSound(150, 0.2, 'square'), 100);
  }
  
  toggle(): void {
    this.enabled = !this.enabled;
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();