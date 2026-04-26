import { _decorator, Button, Label, Sprite } from 'cc';
import { VOLUME_STEP } from '../../data/GameConst';
import { AudioSettingsData } from '../../data/SaveData';
import { BasePanel } from '../base/BasePanel';
import {
    applyButtonTheme,
    applyLabelTone,
    applyMaskStyle,
    applyPanelStyle,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;

export interface SettingsPopupActions {
    onAdjustBgm: (delta: number) => void;
    onAdjustSfx: (delta: number) => void;
    onToggleMute: () => void;
    onToggleVibration: () => void;
    onResetProgress: () => void;
    onClose: () => void;
}

@ccclass('SettingsPopup')
export class SettingsPopup extends BasePanel {
    @property(Sprite)
    public dimMaskSprite: Sprite | null = null;

    @property(Sprite)
    public windowBackgroundSprite: Sprite | null = null;

    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public soundStateValueLabel: Label | null = null;

    @property(Label)
    public bgmValueLabel: Label | null = null;

    @property(Label)
    public sfxValueLabel: Label | null = null;

    @property(Label)
    public vibrationStateValueLabel: Label | null = null;

    @property(Label)
    public resetHintLabel: Label | null = null;

    @property(Button)
    public toggleSoundButton: Button | null = null;

    @property(Sprite)
    public toggleSoundButtonSprite: Sprite | null = null;

    @property(Label)
    public toggleSoundButtonLabel: Label | null = null;

    @property(Button)
    public bgmDownButton: Button | null = null;

    @property(Sprite)
    public bgmDownButtonSprite: Sprite | null = null;

    @property(Label)
    public bgmDownButtonLabel: Label | null = null;

    @property(Button)
    public bgmUpButton: Button | null = null;

    @property(Sprite)
    public bgmUpButtonSprite: Sprite | null = null;

    @property(Label)
    public bgmUpButtonLabel: Label | null = null;

    @property(Button)
    public sfxDownButton: Button | null = null;

    @property(Sprite)
    public sfxDownButtonSprite: Sprite | null = null;

    @property(Label)
    public sfxDownButtonLabel: Label | null = null;

    @property(Button)
    public sfxUpButton: Button | null = null;

    @property(Sprite)
    public sfxUpButtonSprite: Sprite | null = null;

    @property(Label)
    public sfxUpButtonLabel: Label | null = null;

    @property(Button)
    public toggleVibrationButton: Button | null = null;

    @property(Sprite)
    public toggleVibrationButtonSprite: Sprite | null = null;

    @property(Label)
    public toggleVibrationButtonLabel: Label | null = null;

    @property(Button)
    public resetProgressButton: Button | null = null;

    @property(Sprite)
    public resetProgressButtonSprite: Sprite | null = null;

    @property(Label)
    public resetProgressButtonLabel: Label | null = null;

    @property(Button)
    public closeButton: Button | null = null;

    @property(Sprite)
    public closeButtonSprite: Sprite | null = null;

    @property(Label)
    public closeButtonLabel: Label | null = null;

    private actions: SettingsPopupActions | null = null;

    protected onLoad(): void {
        this.applyTheme();
        this.syncStaticText();
    }

    public bindActions(actions: SettingsPopupActions): void {
        this.actions = actions;
    }

    public refresh(settings: AudioSettingsData): void {
        if (this.soundStateValueLabel) {
            this.soundStateValueLabel.string = settings.isMuted ? 'OFF' : 'ON';
        }

        if (this.bgmValueLabel) {
            this.bgmValueLabel.string = `${Math.round(settings.bgmVolume * 100)}%`;
        }

        if (this.sfxValueLabel) {
            this.sfxValueLabel.string = `${Math.round(settings.sfxVolume * 100)}%`;
        }

        if (this.vibrationStateValueLabel) {
            this.vibrationStateValueLabel.string = settings.vibrationEnabled ? 'ON' : 'OFF';
        }

        if (this.toggleSoundButtonLabel) {
            this.toggleSoundButtonLabel.string = settings.isMuted ? 'ENABLE SOUND' : 'MUTE SOUND';
        }

        if (this.toggleVibrationButtonLabel) {
            this.toggleVibrationButtonLabel.string = settings.vibrationEnabled ? 'VIBRATION ON' : 'VIBRATION OFF';
        }
    }

    public onClickToggleSound(): void {
        this.actions?.onToggleMute();
    }

    public onClickBgmDown(): void {
        this.actions?.onAdjustBgm(-VOLUME_STEP);
    }

    public onClickBgmUp(): void {
        this.actions?.onAdjustBgm(VOLUME_STEP);
    }

    public onClickSfxDown(): void {
        this.actions?.onAdjustSfx(-VOLUME_STEP);
    }

    public onClickSfxUp(): void {
        this.actions?.onAdjustSfx(VOLUME_STEP);
    }

    public onClickToggleVibration(): void {
        this.actions?.onToggleVibration();
    }

    public onClickResetProgress(): void {
        this.actions?.onResetProgress();
    }

    public onClickClose(): void {
        this.actions?.onClose();
    }

    private applyTheme(): void {
        applyMaskStyle(this.dimMaskSprite);
        applyPanelStyle(this.windowBackgroundSprite, true);
        applyLabelTone(this.titleLabel, 'title');
        applyLabelTone(this.soundStateValueLabel, 'success');
        applyLabelTone(this.bgmValueLabel, 'success');
        applyLabelTone(this.sfxValueLabel, 'success');
        applyLabelTone(this.vibrationStateValueLabel, 'success');
        applyLabelTone(this.resetHintLabel, 'muted');
        applyButtonTheme(this.toggleSoundButton, this.toggleSoundButtonSprite, this.toggleSoundButtonLabel, 'secondary');
        applyButtonTheme(this.bgmDownButton, this.bgmDownButtonSprite, this.bgmDownButtonLabel, 'secondary');
        applyButtonTheme(this.bgmUpButton, this.bgmUpButtonSprite, this.bgmUpButtonLabel, 'secondary');
        applyButtonTheme(this.sfxDownButton, this.sfxDownButtonSprite, this.sfxDownButtonLabel, 'secondary');
        applyButtonTheme(this.sfxUpButton, this.sfxUpButtonSprite, this.sfxUpButtonLabel, 'secondary');
        applyButtonTheme(
            this.toggleVibrationButton,
            this.toggleVibrationButtonSprite,
            this.toggleVibrationButtonLabel,
            'secondary',
        );
        applyButtonTheme(this.resetProgressButton, this.resetProgressButtonSprite, this.resetProgressButtonLabel, 'danger');
        applyButtonTheme(this.closeButton, this.closeButtonSprite, this.closeButtonLabel, 'secondary');
    }

    private syncStaticText(): void {
        if (this.titleLabel) {
            this.titleLabel.string = 'SYSTEM SETTINGS';
        }

        if (this.bgmDownButtonLabel) {
            this.bgmDownButtonLabel.string = 'BGM -';
        }

        if (this.bgmUpButtonLabel) {
            this.bgmUpButtonLabel.string = 'BGM +';
        }

        if (this.sfxDownButtonLabel) {
            this.sfxDownButtonLabel.string = 'SFX -';
        }

        if (this.sfxUpButtonLabel) {
            this.sfxUpButtonLabel.string = 'SFX +';
        }

        if (this.resetProgressButtonLabel) {
            this.resetProgressButtonLabel.string = 'RESET PROGRESS';
        }

        if (this.closeButtonLabel) {
            this.closeButtonLabel.string = 'CLOSE';
        }

        if (this.resetHintLabel) {
            this.resetHintLabel.string = 'Reset clears local save data only. Audio clips and art are still placeholder assets.';
        }
    }
}
