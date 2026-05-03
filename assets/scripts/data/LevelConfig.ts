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
        title: '第 1 关 / 基础人类检测',
        menuTitle: '基础检测',
        intro: '系统声称这是最简单的人类验证。',
        systemPrompt: '请选择所有明确包含红绿灯的格子。',
        absurdRule: '规则非常严格：残缺、远处模糊和看起来相似的物体都不算。',
        timeLimitSec: 12,
        primaryActionLabel: '提交验证',
        secondaryActionLabel: '重置测试',
        successJudgeTextId: 'level_1_success',
        failureJudgeTextId: 'level_1_failure',
        payload: {
            controllerTitle: '严格图像选择',
            controllerHint: '只选择明确属于红绿灯的格子。相似形状和裁切边缘都会导致失败。',
            gridSize: 3,
            options: [
                {
                    id: 'signal_full_street',
                    title: '清晰信号灯',
                    description: '路口中央完整的红黄绿信号灯。',
                },
                {
                    id: 'signal_edge_crop',
                    title: '边缘残影',
                    description: '只露出一小段被裁切的灯体。',
                },
                {
                    id: 'shop_lantern_stack',
                    title: '相似灯牌',
                    description: '三盏圆形店铺灯竖着排列。',
                },
                {
                    id: 'crossing_signal_overhead',
                    title: '高架信号灯',
                    description: '带倒计时牌的完整高架红绿灯。',
                },
                {
                    id: 'distant_signal_pole',
                    title: '远处杆影',
                    description: '电线和模糊背景后有远处信号形状。',
                },
                {
                    id: 'plain_city_lane',
                    title: '城市街道',
                    description: '普通车道、车辆和标志，没有信号灯头。',
                },
                {
                    id: 'neon_arrow_ad',
                    title: '霓虹箭头',
                    description: '很像信号灯的竖向广告灯。',
                },
                {
                    id: 'crossroad_wide_shot',
                    title: '道路交叉口',
                    description: '宽阔路口画面，没有清晰红绿灯格子。',
                },
                {
                    id: 'camera_pole',
                    title: '监控杆',
                    description: '带监控设备的街杆，不是交通信号。',
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
        title: '第 2 关 / 犹豫扫描',
        menuTitle: '犹豫扫描',
        intro: '系统现在认为，真正的人类会在明显选择前犹豫。',
        systemPrompt: '请点击确认按钮。',
        absurdRule: '太快会失败，重复自信也会失败。系统更喜欢耐心的困惑。',
        timeLimitSec: 10,
        primaryActionLabel: '提交验证',
        secondaryActionLabel: '重置测试',
        successJudgeTextId: 'level_2_success',
        failureJudgeTextId: 'level_2_failure',
        payload: {
            controllerTitle: '伪装确认控制器',
            controllerHint: '按钮本身正在说谎。提交前观察它如何变化。',
            minWaitMs: 2000,
            initialButtonText: '确认',
            firstFailButtonText: '太快了',
            waitingButtonText: '请等待',
            readyButtonText: '现在确认',
            successButtonText: '已接受',
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
        title: '第 3 关 / 逆向逻辑审判',
        menuTitle: '逆向逻辑',
        intro: '到了这一步，系统已经认定正常行为最不像人类。',
        systemPrompt: '拖动滑块，松开后提交系统认为你表达的含义。',
        absurdRule: '界面提示、可见滑块移动和隐藏通过阈值并不完全一致。',
        timeLimitSec: 12,
        primaryActionLabel: '提交验证',
        secondaryActionLabel: '重置测试',
        successJudgeTextId: 'level_3_success',
        failureJudgeTextId: 'level_3_failure',
        payload: {
            controllerTitle: '逆向滑块校准器',
            controllerHint: '拖动滑块并松开，然后点击提交验证。你看到的移动不代表全部真相。',
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
