export interface JudgeTextDefinition {
    id: string;
    title: string;
    lines: string[];
}

export const JUDGE_TEXT_CONFIG_LIST: ReadonlyArray<JudgeTextDefinition> = [
    {
        id: 'menu_intro',
        title: 'SYSTEM NOTICE',
        lines: [
            'Welcome to the prototype verification environment.',
            'Every result is technically official, even when it is absurd.',
        ],
    },
    {
        id: 'level_1_success',
        title: 'INITIAL PASS',
        lines: [
            'The system marked your choice as natural.',
            'Unfortunately, natural behavior is also slightly suspicious.',
        ],
    },
    {
        id: 'level_1_failure',
        title: 'SUSPICIOUS RESPONSE',
        lines: [
            'The system decided your hesitation looked simulated.',
            'Please reorganize your human instincts and try again.',
        ],
    },
    {
        id: 'level_2_success',
        title: 'HESITATION ACCEPTED',
        lines: [
            'Your delay resembles a tired working adult.',
            'The system temporarily accepts that exhaustion as proof of life.',
        ],
    },
    {
        id: 'level_2_failure',
        title: 'REACTION TOO FAST',
        lines: [
            'Your response speed exceeded the ordinary office-worker threshold.',
            'Try looking slightly less efficient next time.',
        ],
    },
    {
        id: 'level_3_success',
        title: 'ABSURDITY VERIFIED',
        lines: [
            'Only a real human would commit to a choice this irrational.',
            'The system accepts your chaos as valid evidence.',
        ],
    },
    {
        id: 'level_3_failure',
        title: 'LOGIC DETECTED',
        lines: [
            'You continued to use reasonable thinking.',
            'Reasonable thinking has been rejected by the current system policy.',
        ],
    },
    {
        id: 'result_default_failure',
        title: 'VERIFICATION FAILED',
        lines: [
            'The system refused to explain the exact cause.',
            'This usually means the system felt like it.',
        ],
    },
];
