# Prove Human Prototype Skeleton

## Recommended Project Structure

```text
assets/
  scenes/                # BootScene, PrototypeScene
  scripts/
    app/                 # GameApp entry
    core/managers/       # global managers
    data/                # constants, configs, save types
    ui/
      base/              # shared UI base classes
      components/        # reusable UI widgets
      views/             # full-page views
      popups/            # modal panels
  prefabs/ui/            # reusable UI prefabs
  resources/
    audio/               # placeholder audio clips
    textures/            # placeholder textures
```

## Scene Flow

- `BootScene` initializes platform adapters and then enters `PrototypeScene`.
- `PrototypeScene` hosts `GameApp`, `TopStatusBar`, `MainMenuView`, `VerifyView`, `ResultPopup`, and `SettingsPopup`.
- `UIManager` switches pages between `MainMenuView` and `VerifyView`.
- `ResultPopup` and `SettingsPopup` stay modal and are stacked by `UIManager`.

## Core Runtime

- `GameApp` is the root coordinator.
- `ConfigManager` owns level config and judge text config.
- `SaveManager` owns local save data and persistence.
- `AudioManager` is a placeholder audio facade.
- `SceneManager` is reserved for scene transitions.
- `UIManager` owns page and popup visibility state.

## Trial Levels

- Level 1: direct confirmation.
- Level 2: reverse expectation.
- Level 3: absurd choice.

Current gameplay uses config-driven level controllers. Level 2 already runs a real controller, while Levels 1 and 3 stay intentionally lightweight placeholders behind the same factory path.

## Scene Wiring Notes

- Attach `GameApp` to a stable root node in `PrototypeScene`.
- Drag `MainMenuView`, `VerifyView`, `ResultPopup`, `SettingsPopup`, and `TopStatusBar` into the corresponding inspector fields.
- Bind UI button click events to the component methods already exposed in each script.
