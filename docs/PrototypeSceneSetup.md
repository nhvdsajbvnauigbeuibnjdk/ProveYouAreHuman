# PrototypeScene Setup

## PrototypeScene Node Tree

```text
PrototypeScene
`- Canvas
   |- BackgroundLayer
   |  |- BackgroundFill                 (Sprite)
   |  `- BackgroundGrid                 (Sprite, optional tint overlay)
   `- SafeAreaRoot                      (Widget + SafeArea)
      `- AppRoot                        (GameApp)
         |- TopStatusBar                (TopStatusBar)
         |  |- BarBackground            (Sprite)
         |  |- StatusDot                (Sprite)
         |  |- SystemNameLabel          (Label)
         |  |- SceneStateLabel          (Label)
         |  |- CurrentLevelLabel        (Label)
         |  |- HumanIndexLabel          (Label)
         |  `- FailureCountLabel        (Label)
         |- MainLayer                   (Widget)
         |  |- MainMenuView             (MainMenuView)
         |  |  `- MenuPanel             (Sprite)
         |  |     |- AccentLine         (Sprite)
         |  |     |- TitleLabel         (Label)
         |  |     |- SubtitleLabel      (Label)
         |  |     |- StatsColumn        (Layout)
         |  |     |  |- CurrentLevelValueLabel
         |  |     |  |- HumanIndexValueLabel
         |  |     |  `- FailureCountValueLabel
         |  |     |- NoticePanel        (Sprite)
         |  |     |  `- NoticeLabel     (Label)
         |  |     `- MenuActionRow      (Layout)
         |  |        |- StartVerifyButton       (Button + Sprite)
         |  |        |  `- StartVerifyButtonLabel
         |  |        `- OpenSettingsButton      (Button + Sprite)
         |  |           `- OpenSettingsButtonLabel
         |  `- VerifyView               (VerifyView)
         |     `- VerifyPanel           (Sprite)
         |        |- StatusChip         (Sprite)
         |        |  `- VerifyStatusLabel
         |        |- VerifyTitleLabel   (Label)
         |        |- VerifySubtitleLabel(Label)
         |        |- InstructionPanel   (Sprite)
         |        |  |- LevelCodeLabel
         |        |  |- PromptLabel
         |        |  `- RuleLabel
         |        |- PlaceholderCard    (Sprite)
         |        |  |- PlaceholderCardTitleLabel
         |        |  |- PlaceholderCardBodyLabel
         |        |  `- LevelMountContainer
         |        `- VerifyActionRow    (Layout)
         |           |- ConfirmButton          (Button + Sprite)
         |           |  `- ConfirmButtonLabel
         |           |- RetryButton            (Button + Sprite)
         |           |  `- RetryButtonLabel
         |           `- BackMenuButton         (Button + Sprite)
         |              `- BackMenuButtonLabel
         `- ModalLayer                  (Widget)
            |- ResultPopup             (ResultPopup, inactive)
            |  |- ResultMask           (Sprite + BlockInputEvents)
            |  `- ResultWindow         (Sprite)
            |     |- ResultStateBar    (Sprite)
            |     |- ResultTitleLabel  (Label)
            |     |- ResultStateLabel  (Label)
            |     |- ResultMessageLabel(Label)
            |     `- ResultButtonRow   (Layout)
            |        |- ResultPrimaryButton    (Button + Sprite)
            |        |  `- ResultPrimaryButtonLabel
            |        `- ResultSecondaryButton  (Button + Sprite)
            |           `- ResultSecondaryButtonLabel
            `- SettingsPopup           (SettingsPopup, inactive)
               |- SettingsMask         (Sprite + BlockInputEvents)
               `- SettingsWindow       (Sprite)
                  |- SettingsTitleLabel
                  |- SoundStateValueLabel
                  |- BgmValueLabel
                  |- SfxValueLabel
                  |- VibrationStateValueLabel
                  |- ResetHintLabel
                  |- ToggleSoundButton         (Button + Sprite)
                  |  `- ToggleSoundButtonLabel
                  |- BgmDownButton             (Button + Sprite)
                  |  `- BgmDownButtonLabel
                  |- BgmUpButton               (Button + Sprite)
                  |  `- BgmUpButtonLabel
                  |- SfxDownButton             (Button + Sprite)
                  |  `- SfxDownButtonLabel
                  |- SfxUpButton               (Button + Sprite)
                  |  `- SfxUpButtonLabel
                  |- ToggleVibrationButton     (Button + Sprite)
                  |  `- ToggleVibrationButtonLabel
                  |- ResetProgressButton       (Button + Sprite)
                  |  `- ResetProgressButtonLabel
                  `- CloseButton               (Button + Sprite)
                     `- CloseButtonLabel
```

## Inspector Binding Table

### GameApp

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| GameApp | `mainMenuView` | `MainMenuView` | `MainMenuView` | Main menu page root |
| GameApp | `verifyView` | `VerifyView` | `VerifyView` | Verify page root |
| GameApp | `resultPopup` | `ResultPopup` | `ResultPopup` | Result modal root |
| GameApp | `settingsPopup` | `SettingsPopup` | `SettingsPopup` | Settings modal root |
| GameApp | `topStatusBar` | `TopStatusBar` | `TopStatusBar` | Persistent top bar |

### MainMenuView

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| MainMenuView | `panelBackgroundSprite` | `MenuPanel` | `Sprite` | Main page panel background |
| MainMenuView | `noticePanelSprite` | `NoticePanel` | `Sprite` | Notice card background |
| MainMenuView | `panelAccentLineSprite` | `AccentLine` | `Sprite` | Decorative accent line |
| MainMenuView | `titleLabel` | `TitleLabel` | `Label` | Game title |
| MainMenuView | `subtitleLabel` | `SubtitleLabel` | `Label` | Subtitle / build tag |
| MainMenuView | `currentLevelValueLabel` | `CurrentLevelValueLabel` | `Label` | Current selected level |
| MainMenuView | `humanIndexValueLabel` | `HumanIndexValueLabel` | `Label` | Calculated human index |
| MainMenuView | `failureCountValueLabel` | `FailureCountValueLabel` | `Label` | Total failures |
| MainMenuView | `systemNoticeLabel` | `NoticeLabel` | `Label` | Notice text |
| MainMenuView | `startVerifyButton` | `StartVerifyButton` | `Button` | Start verify button |
| MainMenuView | `startVerifyButtonSprite` | `StartVerifyButton` | `Sprite` | Start button tint |
| MainMenuView | `startVerifyButtonLabel` | `StartVerifyButtonLabel` | `Label` | Start button text |
| MainMenuView | `openSettingsButton` | `OpenSettingsButton` | `Button` | Open settings button |
| MainMenuView | `openSettingsButtonSprite` | `OpenSettingsButton` | `Sprite` | Settings button tint |
| MainMenuView | `openSettingsButtonLabel` | `OpenSettingsButtonLabel` | `Label` | Settings button text |

### VerifyView

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| VerifyView | `panelBackgroundSprite` | `VerifyPanel` | `Sprite` | Verify page panel |
| VerifyView | `instructionPanelSprite` | `InstructionPanel` | `Sprite` | Rule text card |
| VerifyView | `levelCardSprite` | `PlaceholderCard` | `Sprite` | Level gameplay card background |
| VerifyView | `statusChipSprite` | `StatusChip` | `Sprite` | Pass/fail preview chip |
| VerifyView | `titleLabel` | `VerifyTitleLabel` | `Label` | Verify title |
| VerifyView | `subtitleLabel` | `VerifySubtitleLabel` | `Label` | Verify intro |
| VerifyView | `statusLabel` | `VerifyStatusLabel` | `Label` | Current level status |
| VerifyView | `levelCodeLabel` | `LevelCodeLabel` | `Label` | Level code / level type |
| VerifyView | `promptLabel` | `PromptLabel` | `Label` | System prompt |
| VerifyView | `ruleLabel` | `RuleLabel` | `Label` | Absurd rule |
| VerifyView | `levelCardTitleLabel` | `PlaceholderCardTitleLabel` | `Label` | Level controller title |
| VerifyView | `levelStateLabel` | `PlaceholderCardBodyLabel` | `Label` | Level controller state text |
| VerifyView | `levelContainer` | `LevelMountContainer` | `Node` | Dynamic controller mount root |
| VerifyView | `confirmButton` | `ConfirmButton` | `Button` | Confirm trigger |
| VerifyView | `confirmButtonSprite` | `ConfirmButton` | `Sprite` | Confirm button tint |
| VerifyView | `confirmButtonLabel` | `ConfirmButtonLabel` | `Label` | Confirm button text |
| VerifyView | `retryButton` | `RetryButton` | `Button` | Reset current level controller |
| VerifyView | `retryButtonSprite` | `RetryButton` | `Sprite` | Retry button tint |
| VerifyView | `retryButtonLabel` | `RetryButtonLabel` | `Label` | Retry button text |
| VerifyView | `backMenuButton` | `BackMenuButton` | `Button` | Return to menu |
| VerifyView | `backMenuButtonSprite` | `BackMenuButton` | `Sprite` | Back button tint |
| VerifyView | `backMenuButtonLabel` | `BackMenuButtonLabel` | `Label` | Back button text |

### ResultPopup

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| ResultPopup | `dimMaskSprite` | `ResultMask` | `Sprite` | Screen dim layer |
| ResultPopup | `windowBackgroundSprite` | `ResultWindow` | `Sprite` | Popup body |
| ResultPopup | `resultStateBarSprite` | `ResultStateBar` | `Sprite` | Success / fail accent bar |
| ResultPopup | `titleLabel` | `ResultTitleLabel` | `Label` | Result title |
| ResultPopup | `stateLabel` | `ResultStateLabel` | `Label` | PASS / FAIL status |
| ResultPopup | `messageLabel` | `ResultMessageLabel` | `Label` | Judge text body |
| ResultPopup | `primaryButton` | `ResultPrimaryButton` | `Button` | Retry or next level |
| ResultPopup | `primaryButtonSprite` | `ResultPrimaryButton` | `Sprite` | Primary button tint |
| ResultPopup | `primaryButtonLabel` | `ResultPrimaryButtonLabel` | `Label` | Primary button text |
| ResultPopup | `secondaryButton` | `ResultSecondaryButton` | `Button` | Back to menu |
| ResultPopup | `secondaryButtonSprite` | `ResultSecondaryButton` | `Sprite` | Secondary button tint |
| ResultPopup | `secondaryButtonLabel` | `ResultSecondaryButtonLabel` | `Label` | Secondary button text |

### SettingsPopup

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| SettingsPopup | `dimMaskSprite` | `SettingsMask` | `Sprite` | Screen dim layer |
| SettingsPopup | `windowBackgroundSprite` | `SettingsWindow` | `Sprite` | Popup body |
| SettingsPopup | `titleLabel` | `SettingsTitleLabel` | `Label` | Popup title |
| SettingsPopup | `soundStateValueLabel` | `SoundStateValueLabel` | `Label` | Sound on/off state |
| SettingsPopup | `bgmValueLabel` | `BgmValueLabel` | `Label` | BGM volume value |
| SettingsPopup | `sfxValueLabel` | `SfxValueLabel` | `Label` | SFX volume value |
| SettingsPopup | `vibrationStateValueLabel` | `VibrationStateValueLabel` | `Label` | Vibration state |
| SettingsPopup | `resetHintLabel` | `ResetHintLabel` | `Label` | Reset warning text |
| SettingsPopup | `toggleSoundButton` | `ToggleSoundButton` | `Button` | Toggle sound |
| SettingsPopup | `toggleSoundButtonSprite` | `ToggleSoundButton` | `Sprite` | Toggle sound tint |
| SettingsPopup | `toggleSoundButtonLabel` | `ToggleSoundButtonLabel` | `Label` | Toggle sound text |
| SettingsPopup | `bgmDownButton` | `BgmDownButton` | `Button` | BGM down |
| SettingsPopup | `bgmDownButtonSprite` | `BgmDownButton` | `Sprite` | BGM down tint |
| SettingsPopup | `bgmDownButtonLabel` | `BgmDownButtonLabel` | `Label` | BGM down text |
| SettingsPopup | `bgmUpButton` | `BgmUpButton` | `Button` | BGM up |
| SettingsPopup | `bgmUpButtonSprite` | `BgmUpButton` | `Sprite` | BGM up tint |
| SettingsPopup | `bgmUpButtonLabel` | `BgmUpButtonLabel` | `Label` | BGM up text |
| SettingsPopup | `sfxDownButton` | `SfxDownButton` | `Button` | SFX down |
| SettingsPopup | `sfxDownButtonSprite` | `SfxDownButton` | `Sprite` | SFX down tint |
| SettingsPopup | `sfxDownButtonLabel` | `SfxDownButtonLabel` | `Label` | SFX down text |
| SettingsPopup | `sfxUpButton` | `SfxUpButton` | `Button` | SFX up |
| SettingsPopup | `sfxUpButtonSprite` | `SfxUpButton` | `Sprite` | SFX up tint |
| SettingsPopup | `sfxUpButtonLabel` | `SfxUpButtonLabel` | `Label` | SFX up text |
| SettingsPopup | `toggleVibrationButton` | `ToggleVibrationButton` | `Button` | Toggle vibration |
| SettingsPopup | `toggleVibrationButtonSprite` | `ToggleVibrationButton` | `Sprite` | Toggle vibration tint |
| SettingsPopup | `toggleVibrationButtonLabel` | `ToggleVibrationButtonLabel` | `Label` | Toggle vibration text |
| SettingsPopup | `resetProgressButton` | `ResetProgressButton` | `Button` | Reset local save |
| SettingsPopup | `resetProgressButtonSprite` | `ResetProgressButton` | `Sprite` | Reset button tint |
| SettingsPopup | `resetProgressButtonLabel` | `ResetProgressButtonLabel` | `Label` | Reset button text |
| SettingsPopup | `closeButton` | `CloseButton` | `Button` | Close popup |
| SettingsPopup | `closeButtonSprite` | `CloseButton` | `Sprite` | Close button tint |
| SettingsPopup | `closeButtonLabel` | `CloseButtonLabel` | `Label` | Close button text |

### TopStatusBar

| Script | Field | Node Name | Component Type | Note |
| --- | --- | --- | --- | --- |
| TopStatusBar | `barBackgroundSprite` | `BarBackground` | `Sprite` | Bar background |
| TopStatusBar | `statusDotSprite` | `StatusDot` | `Sprite` | Status indicator dot |
| TopStatusBar | `systemNameLabel` | `SystemNameLabel` | `Label` | System name |
| TopStatusBar | `sceneStateLabel` | `SceneStateLabel` | `Label` | Current scene state |
| TopStatusBar | `currentLevelLabel` | `CurrentLevelLabel` | `Label` | Current level |
| TopStatusBar | `humanIndexLabel` | `HumanIndexLabel` | `Label` | Human index |
| TopStatusBar | `failureCountLabel` | `FailureCountLabel` | `Label` | Failure count |

## Button Click Event Table

| Node Name | Target Component | Handler |
| --- | --- | --- |
| `StartVerifyButton` | `MainMenuView` | `onClickStartVerify` |
| `OpenSettingsButton` | `MainMenuView` | `onClickOpenSettings` |
| `ConfirmButton` | `VerifyView` | `onClickConfirm` |
| `RetryButton` | `VerifyView` | `onClickRetry` |
| `BackMenuButton` | `VerifyView` | `onClickBackToMenu` |
| `ResultPrimaryButton` | `ResultPopup` | `onClickPrimary` |
| `ResultSecondaryButton` | `ResultPopup` | `onClickSecondary` |
| `ToggleSoundButton` | `SettingsPopup` | `onClickToggleSound` |
| `BgmDownButton` | `SettingsPopup` | `onClickBgmDown` |
| `BgmUpButton` | `SettingsPopup` | `onClickBgmUp` |
| `SfxDownButton` | `SettingsPopup` | `onClickSfxDown` |
| `SfxUpButton` | `SettingsPopup` | `onClickSfxUp` |
| `ToggleVibrationButton` | `SettingsPopup` | `onClickToggleVibration` |
| `ResetProgressButton` | `SettingsPopup` | `onClickResetProgress` |
| `CloseButton` | `SettingsPopup` | `onClickClose` |

## Manual Build Steps

1. Create `PrototypeScene`, keep the default `Canvas`, and add `BackgroundLayer`, `SafeAreaRoot`, and `AppRoot`.
2. Add `Widget` to `SafeAreaRoot` and stretch it to full screen. Add `SafeArea` if your Creator version provides it.
3. Under `Canvas/BackgroundLayer`, create `BackgroundFill` and `BackgroundGrid`, add `Sprite`, and reuse the same built-in white sprite frame for tint-only panels.
4. Add `GameApp` to `SafeAreaRoot/AppRoot`.
5. Create `TopStatusBar` under `AppRoot`, add `TopStatusBar.ts`, then add `BarBackground`, `StatusDot`, and the five label nodes listed in the table.
6. Create `MainLayer` and `ModalLayer` under `AppRoot`. Add `Widget` to both and stretch them full screen.
7. Create `MainMenuView` under `MainLayer`, add `MainMenuView.ts`, then add `MenuPanel`, `AccentLine`, `TitleLabel`, `SubtitleLabel`, `StatsColumn`, `NoticePanel`, `NoticeLabel`, and the two menu buttons.
8. Create `VerifyView` under `MainLayer`, add `VerifyView.ts`, then add `VerifyPanel`, `StatusChip`, `VerifyStatusLabel`, `VerifyTitleLabel`, `VerifySubtitleLabel`, `InstructionPanel`, `LevelCodeLabel`, `PromptLabel`, `RuleLabel`, `PlaceholderCard`, `PlaceholderCardTitleLabel`, `PlaceholderCardBodyLabel`, `LevelMountContainer`, and the three action buttons.
9. Create `ResultPopup` under `ModalLayer`, set the node inactive, add `ResultPopup.ts`, then create `ResultMask`, `ResultWindow`, `ResultStateBar`, title/state/message labels, and the two popup buttons.
10. Create `SettingsPopup` under `ModalLayer`, set the node inactive, add `SettingsPopup.ts`, then create the state labels, all control buttons, and `ResetHintLabel`.
11. Add `BlockInputEvents` to `ResultMask` and `SettingsMask` so modal clicks do not pass through to the page below.
12. Add `Layout` to `StatsColumn`, `MenuActionRow`, `VerifyActionRow`, `ResultButtonRow`, and any settings button rows so the UI stays tidy without art assets.
13. For every button node, add both `Button` and `Sprite`, then add a child label node with `Label`. The same white sprite frame can be reused and tinted by script.
14. Bind every button click event exactly as listed in the button event table.
15. Drag all inspector fields from the table into their matching script fields, starting from `GameApp`, then each page/popup component.
16. Press Play. Expected flow: `MainMenuView` shows first, `StartVerifyButton` enters `VerifyView`, the dynamic controller mounts under `LevelMountContainer`, `ConfirmButton` validates the active controller and opens `ResultPopup`, `RetryButton` resets the current controller, `OpenSettingsButton` opens `SettingsPopup`, and `TopStatusBar` updates from save data.
