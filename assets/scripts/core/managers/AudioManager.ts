import { clamp01 } from 'cc';
import { AudioSettingsData } from '../../data/SaveData';

export class AudioManager {
    private settings: AudioSettingsData = {
        bgmVolume: 0.6,
        sfxVolume: 0.8,
        isMuted: false,
        vibrationEnabled: true,
    };

    public initialize(settings: AudioSettingsData): void {
        this.settings = { ...settings };
    }

    public playBgm(trackName: string): void {
        if (this.settings.isMuted) {
            return;
        }

        console.info(`[AudioManager] Play BGM placeholder: ${trackName}`);
    }

    public playSfx(clipName: string): void {
        if (this.settings.isMuted) {
            return;
        }

        console.info(`[AudioManager] Play SFX placeholder: ${clipName}`);
    }

    public adjustBgmVolume(delta: number): AudioSettingsData {
        this.settings.bgmVolume = clamp01(this.settings.bgmVolume + delta);
        return this.getSettings();
    }

    public adjustSfxVolume(delta: number): AudioSettingsData {
        this.settings.sfxVolume = clamp01(this.settings.sfxVolume + delta);
        return this.getSettings();
    }

    public toggleMute(): AudioSettingsData {
        this.settings.isMuted = !this.settings.isMuted;
        return this.getSettings();
    }

    public toggleVibration(): AudioSettingsData {
        this.settings.vibrationEnabled = !this.settings.vibrationEnabled;
        return this.getSettings();
    }

    public getSettings(): AudioSettingsData {
        return { ...this.settings };
    }
}
