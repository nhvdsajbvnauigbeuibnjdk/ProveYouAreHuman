import { FAILURE_RESULT_TITLE } from './GameConst';

export interface JudgeTextDefinition {
    id: string;
    title: string;
    lines: string[];
}

export const JUDGE_TEXT_CONFIG_LIST: ReadonlyArray<JudgeTextDefinition> = [
    {
        id: 'menu_intro',
        title: '系统提示',
        lines: [
            '欢迎进入原型验证环境。',
            '每一次结果在技术上都是正式的，即使它显得很荒谬。',
        ],
    },
    {
        id: 'level_1_success',
        title: '初步通过',
        lines: [
            '系统将你的选择标记为自然。',
            '遗憾的是，自然行为本身也有一点可疑。',
        ],
    },
    {
        id: 'level_1_failure',
        title: '可疑响应',
        lines: [
            '系统认为你的犹豫看起来像模拟出来的。',
            '请整理一下人类本能后再试一次。',
        ],
    },
    {
        id: 'level_2_success',
        title: '犹豫已接受',
        lines: [
            '你的延迟很像疲惫的上班族。',
            '系统暂时接受这种疲惫作为生命迹象。',
        ],
    },
    {
        id: 'level_2_failure',
        title: '反应过快',
        lines: [
            '你的响应速度超过了普通办公室人类阈值。',
            '下次请显得稍微低效一点。',
        ],
    },
    {
        id: 'level_3_success',
        title: '荒谬性已验证',
        lines: [
            '只有真正的人类会认真执行这种不合理选择。',
            '系统接受你的混乱作为有效证据。',
        ],
    },
    {
        id: 'level_3_failure',
        title: '检测到逻辑',
        lines: [
            '你仍然在使用合理思考。',
            '合理思考已被当前系统策略拒绝。',
        ],
    },
    {
        id: 'result_default_failure',
        title: FAILURE_RESULT_TITLE,
        lines: [
            '系统拒绝解释确切原因。',
            '这通常表示系统只是想这样做。',
        ],
    },
];
