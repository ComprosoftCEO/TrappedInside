import * as THREE from 'three';

/**
 * Wrapper around the THREE.js audio type that makes it easier to work with
 */
export class AudioWrapper<Audio extends THREE.Audio<AudioNode> = THREE.Audio> {
  public readonly audio: Audio;

  constructor(audio: Audio) {
    this.audio = audio;
  }

  public get volume(): number {
    return this.audio.getVolume();
  }

  public set volume(volume: number) {
    this.audio.setVolume(volume);
  }

  public get loop(): boolean {
    return this.audio.getLoop();
  }

  public set loop(loop: boolean) {
    this.audio.setLoop(loop);
  }

  public get isPlaying(): boolean {
    return this.audio.isPlaying;
  }

  /**
   * Play the audio, stopping any existing audio if it is already playing
   *
   * @param looping Optionally set the value of looping if provided
   */
  public play(looping?: boolean): void {
    if (this.audio.isPlaying) {
      this.audio.stop();
    }

    if (typeof looping !== 'undefined') {
      this.loop = looping;
    }

    this.audio.play();
  }

  /**
   * Stop playing the audio if it is currently playing.
   * Otherwise, this method has no effect.
   */
  public stop(): void {
    if (this.audio.isPlaying) {
      this.audio.stop();
    }
  }
}
