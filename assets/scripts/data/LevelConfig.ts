export enum LevelType {
    SelectImage = 'select-image',
    FakeButton = 'fake-button',
    ReverseSlider = 'reverse-slider',
}

export interface BaseLevelPayload {
    controllerTitle: string;
    controllerHint: string;
}

export interface SelectImageOptionDefinition {
    id: string;
    title: string;
    description: string;
}

export interface SelectImagePayload extends BaseLevelPayload {
    gridSize: number;
    options: SelectImageOptionDefinition[];
    correctIndexes: number[];
    ambiguousIndexes: number[];
    decoyIndexes: number[];
}

export interface FakeButtonPayload extends BaseLevelPayload {
    minWaitMs: number;
    initialButtonText: string;
    firstFailButtonText: string;
    waitingButtonText: string;
    readyButtonText: string;
    successButtonText: string;
    initialOffsetX: number;
    initialOffsetY: number;
    firstFailOffsetX: number;
    firstFailOffsetY: number;
    waitingOffsetX: number;
    waitingOffsetY: number;
    readyOffsetX: number;
    readyOffsetY: number;
}

export type SliderDirection = 'left' | 'right';

export interface SliderDragRange {
    min: number;
    max: number;
}

export interface ReverseSliderPayload extends BaseLevelPayload {
    direction: SliderDirection;
    reverseControl: boolean;
    threshold: number;
    startPosition: number;
    visualStartPosition: number;
    autoValidateOnRelease: boolean;
    dragRange: SliderDragRange;
    promptText: string;
}

export interface LevelPayloadMap {
    [LevelType.SelectImage]: SelectImagePayload;
    [LevelType.FakeButton]: FakeButtonPayload;
    [LevelType.ReverseSlider]: ReverseSliderPayload;
}

interface BaseLevelDefinition<T extends LevelType> {
    id: number;
    key: string;
    type: T;
    title: string;
    menuTitle: string;
    intro: string;
    systemPrompt: string;
    absurdRule: string;
    timeLimitSec: number;
    primaryActionLabel: string;
    secondaryActionLabel: string;
    successJudgeTextId: string;
    failureJudgeTextId: string;
    payload: LevelPayloadMap[T];
}

export type SelectImageLevelConfig = BaseLevelDefinition<LevelType.SelectImage>;
export type FakeButtonLevelConfig = BaseLevelDefinition<LevelType.FakeButton>;
export type ReverseSliderLevelConfig = BaseLevelDefinition<LevelType.ReverseSlider>;

export type LevelDefinition =
    | SelectImageLevelConfig
    | FakeButtonLevelConfig
    | ReverseSliderLevelConfig;

export const LEVEL_CONFIG_LIST: ReadonlyArray<LevelDefinition> = [
    {
        id: 1,
        key: 'welcome_check',
        type: LevelType.SelectImage,
        title: 'LEVEL 01 / BASIC HUMAN CHECK',
        menuTitle: 'BASIC CHECK',
        intro: 'The system insists this is the easiest human verification in the trial build.',
        systemPrompt: 'Select every tile that clearly contains a traffic light.',
        absurdRule: 'The rule is strict. Partial traffic lights, distant fragments, and lookalikes do not count.',
        timeLimitSec: 12,
        primaryActionLabel: 'VERIFY SELECTION',
        secondaryActionLabel: 'CLEAR SELECTION',
        successJudgeTextId: 'level_1_success',
        failureJudgeTextId: 'level_1_failure',
        payload: {
            controllerTitle: 'STRICT IMAGE SELECTION',
            controllerHint: 'Pick only the tiles that clearly belong to a traffic light. Similar shapes and cropped edges fail the check.',
            gridSize: 3,
            options: [
                {
                    id: 'signal_full_street',
                    title: 'CLEAR SIGNAL',
                    description: 'Full red-yellow-green light at the intersection center.',
                },
                {
                    id: 'signal_edge_crop',
                    title: 'EDGE SIGNAL',
                    description: 'Only a cropped slice of the lamp body is visible.',
                },
                {
                    id: 'shop_lantern_stack',
                    title: 'LOOKALIKE LAMP',
                    description: 'Three round storefront lamps stacked vertically.',
                },
                {
                    id: 'crossing_signal_overhead',
                    title: 'OVERHEAD SIGNAL',
                    description: 'Complete overhead traffic light with countdown panel.',
                },
                {
                    id: 'distant_signal_pole',
                    title: 'DISTANT POLE',
                    description: 'A far signal shape appears behind cables and blur.',
                },
                {
                    id: 'plain_city_lane',
                    title: 'CITY STREET',
                    description: 'Ordinary lane with cars, signs, and no signal head.',
                },
                {
                    id: 'neon_arrow_ad',
                    title: 'NEON ARROW',
                    description: 'Bright vertical ad lights that resemble a signal.',
                },
                {
                    id: 'crossroad_wide_shot',
                    title: 'ROAD JUNCTION',
                    description: 'Wide crossing view without a clear traffic light tile.',
                },
                {
                    id: 'camera_pole',
                    title: 'CAMERA POLE',
                    description: 'Street pole with surveillance gear, not traffic control.',
                },
            ],
            correctIndexes: [0, 3],
            ambiguousIndexes: [1, 4],
            decoyIndexes: [2, 5, 6, 7, 8],
        },
    },
    {
        id: 2,
        key: 'hesitation_check',
        type: LevelType.FakeButton,
        title: 'LEVEL 02 / HESITATION SCAN',
        menuTitle: 'HESITATION SCAN',
        intro: 'The system now believes real people hesitate before making obvious choices.',
        systemPrompt: 'Please click the confirm button.',
        absurdRule: 'Fast confidence fails. Repeated confidence fails. Patient confusion is preferred.',
        timeLimitSec: 10,
        primaryActionLabel: 'SUBMIT CHECK',
        secondaryActionLabel: 'RESET TEST',
        successJudgeTextId: 'level_2_success',
        failureJudgeTextId: 'level_2_failure',
        payload: {
            controllerTitle: 'FAKE CONFIRM CONTROLLER',
            controllerHint: 'The button itself is lying. Watch how it changes before you submit.',
            minWaitMs: 2000,
            initialButtonText: 'CONFIRM',
            firstFailButtonText: 'TOO FAST',
            waitingButtonText: 'WAIT...',
            readyButtonText: 'NOW CONFIRM',
            successButtonText: 'ACCEPTED',
            initialOffsetX: 0,
            initialOffsetY: 0,
            firstFailOffsetX: 18,
            firstFailOffsetY: -10,
            waitingOffsetX: -14,
            waitingOffsetY: 12,
            readyOffsetX: 22,
            readyOffsetY: 8,
        },
    },
    {
        id: 3,
        key: 'reverse_logic',
        type: LevelType.ReverseSlider,
        title: 'LEVEL 03 / REVERSE LOGIC COURT',
        menuTitle: 'REVERSE LOGIC',
        intro: 'By this point the system has decided that normal behavior is the least human option.',
        systemPrompt: 'Drag the slider, release it, then submit whatever the system thinks you meant.',
        absurdRule: 'The displayed instruction, visible slider movement, and hidden pass threshold do not fully agree.',
        timeLimitSec: 12,
        primaryActionLabel: 'SUBMIT CHECK',
        secondaryActionLabel: 'RESET TEST',
        successJudgeTextId: 'level_3_success',
        failureJudgeTextId: 'level_3_failure',
        payload: {
            controllerTitle: 'REVERSE SLIDER CALIBRATOR',
            controllerHint: 'Drag the handle, release it, then press SUBMIT CHECK. The visible motion is not the full story.',
            direction: 'left',
            reverseControl: true,
            threshold: 0.18,
            startPosition: 0.42,
            visualStartPosition: 0.74,
            autoValidateOnRelease: false,
            dragRange: {
                min: 0.08,
                max: 0.92,
            },
            promptText: '\u5411\u5de6\u62d6\u52a8\u6ed1\u5757\u5b8c\u6210\u62fc\u56fe',
        },
    },
];
