export const GAME_NAME = '\u8bc1\u660e\u4f60\u662f\u4eba\u7c7b';
export const GAME_NAME_EN = '证明你是人类';
export const GAME_SUBTITLE = '荒诞验证原型';
export const FAILURE_RESULT_TITLE = '验证失败，确诊为人机';
export const SAVE_STORAGE_KEY = 'prove-human.save.v1';
export const SAVE_DATA_VERSION = 1;
export const TRIAL_LEVEL_COUNT = 3;

export const DEFAULT_BGM_VOLUME = 0.6;
export const DEFAULT_SFX_VOLUME = 0.8;
export const MIN_VOLUME = 0;
export const MAX_VOLUME = 1;
export const VOLUME_STEP = 0.1;

export enum GameSceneId {
    Boot = 'BootScene',
    Prototype = 'PrototypeScene',
}

export enum UIPageId {
    MainMenu = 'MainMenu',
    Verify = 'Verify',
}

export enum UIPopupId {
    Result = 'ResultPopup',
    Settings = 'SettingsPopup',
}

export enum VerifyMechanicType {
    TapConfirm = 'tap-confirm',
    WaitNoTouch = 'wait-no-touch',
    ReverseChoice = 'reverse-choice',
}

export enum MockActionId {
    Primary = 'primary',
    Secondary = 'secondary',
}

export enum LevelResultType {
    None = 'none',
    Success = 'success',
    Failure = 'failure',
}
