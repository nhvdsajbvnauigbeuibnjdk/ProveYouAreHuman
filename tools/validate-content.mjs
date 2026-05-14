import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const nodeRequire = createRequire(import.meta.url);

const moduleCache = new Map();

function loadTsModule(relativePath) {
    const requestedPath = path.resolve(projectRoot, relativePath);
    const absolutePath = fs.existsSync(requestedPath) ? requestedPath : `${requestedPath}.ts`;
    const cached = moduleCache.get(absolutePath);

    if (cached) {
        return cached.exports;
    }

    const source = fs.readFileSync(absolutePath, 'utf8');
    const output = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
        fileName: absolutePath,
    }).outputText;
    const module = { exports: {} };
    moduleCache.set(absolutePath, module);

    const localRequire = (request) => {
        if (request.startsWith('.')) {
            return loadTsModule(path.relative(projectRoot, path.resolve(path.dirname(absolutePath), request)));
        }

        return nodeRequire(request);
    };

    const runner = new Function('exports', 'require', 'module', '__filename', '__dirname', output);
    runner(module.exports, localRequire, module, absolutePath, path.dirname(absolutePath));

    return module.exports;
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertText(value, pathLabel) {
    assert(typeof value === 'string' && value.trim().length > 0, `${pathLabel} must be non-empty text.`);
    assert(!/\b(TODO|TBD|FIXME)\b/i.test(value), `${pathLabel} contains unfinished placeholder text.`);
}

function assertRatio(value, pathLabel) {
    assert(typeof value === 'number' && value >= 0 && value <= 1, `${pathLabel} must be between 0 and 1.`);
}

function validateSelectImage(level) {
    const payload = level.payload;
    const expectedCount = payload.gridSize * payload.gridSize;
    const allIndexes = [
        ...payload.correctIndexes,
        ...payload.ambiguousIndexes,
        ...payload.decoyIndexes,
    ];

    assert(Number.isInteger(payload.gridSize) && payload.gridSize >= 2, `Level ${level.id} gridSize must be at least 2.`);
    assert(payload.options.length === expectedCount, `Level ${level.id} option count must equal gridSize squared.`);
    assert(payload.correctIndexes.length > 0, `Level ${level.id} needs at least one correct index.`);
    assert(new Set(allIndexes).size === allIndexes.length, `Level ${level.id} index groups must not overlap.`);
    assert(allIndexes.length === expectedCount, `Level ${level.id} index groups must cover every option.`);
    allIndexes.forEach((index) => {
        assert(Number.isInteger(index) && index >= 0 && index < expectedCount, `Level ${level.id} has out-of-range index ${index}.`);
    });
    payload.options.forEach((option, optionIndex) => {
        assertText(option.id, `Level ${level.id} option ${optionIndex + 1}.id`);
        assertText(option.title, `Level ${level.id} option ${optionIndex + 1}.title`);
        assertText(option.description, `Level ${level.id} option ${optionIndex + 1}.description`);
    });
}

function validateFakeButton(level) {
    const payload = level.payload;
    assert(Number.isInteger(payload.minWaitMs) && payload.minWaitMs >= 500, `Level ${level.id} minWaitMs must be at least 500.`);
    [
        'initialButtonText',
        'firstFailButtonText',
        'waitingButtonText',
        'readyButtonText',
        'successButtonText',
    ].forEach((key) => assertText(payload[key], `Level ${level.id}.${key}`));
}

function validateReverseSlider(level) {
    const payload = level.payload;
    assert(payload.direction === 'left' || payload.direction === 'right', `Level ${level.id} direction must be left or right.`);
    assertRatio(payload.threshold, `Level ${level.id}.threshold`);
    assertRatio(payload.startPosition, `Level ${level.id}.startPosition`);
    assertRatio(payload.visualStartPosition, `Level ${level.id}.visualStartPosition`);
    assertRatio(payload.dragRange.min, `Level ${level.id}.dragRange.min`);
    assertRatio(payload.dragRange.max, `Level ${level.id}.dragRange.max`);
    assert(payload.dragRange.min < payload.dragRange.max, `Level ${level.id} dragRange must be ordered.`);
    assertText(payload.promptText, `Level ${level.id}.promptText`);
}

const { LEVEL_CONFIG_LIST, LevelType } = loadTsModule('assets/scripts/data/LevelConfig.ts');
const { JUDGE_TEXT_CONFIG_LIST } = loadTsModule('assets/scripts/data/JudgeTextConfig.ts');
const { FAILURE_RESULT_TITLE, TRIAL_LEVEL_COUNT } = loadTsModule('assets/scripts/data/GameConst.ts');

const judgeTextIds = new Set(JUDGE_TEXT_CONFIG_LIST.map((item) => item.id));
const levelKeys = new Set();
const usedTypes = new Set();

assert(LEVEL_CONFIG_LIST.length === 3, 'Current release content must contain exactly 3 levels.');
assert(TRIAL_LEVEL_COUNT === LEVEL_CONFIG_LIST.length, 'TRIAL_LEVEL_COUNT must match LEVEL_CONFIG_LIST.length.');
assert(FAILURE_RESULT_TITLE === '验证失败，确诊为人机', 'FAILURE_RESULT_TITLE must match the release failure popup copy.');

LEVEL_CONFIG_LIST.forEach((level, index) => {
    assert(level.id === index + 1, `Level ids must be sequential. Expected ${index + 1}, got ${level.id}.`);
    assert(!levelKeys.has(level.key), `Duplicate level key: ${level.key}.`);
    levelKeys.add(level.key);
    usedTypes.add(level.type);

    [
        'key',
        'title',
        'menuTitle',
        'intro',
        'systemPrompt',
        'absurdRule',
        'primaryActionLabel',
        'secondaryActionLabel',
    ].forEach((key) => assertText(level[key], `Level ${level.id}.${key}`));

    assert(Number.isInteger(level.timeLimitSec) && level.timeLimitSec >= 8 && level.timeLimitSec <= 30, `Level ${level.id} timeLimitSec must be 8-30.`);
    assert(judgeTextIds.has(level.successJudgeTextId), `Level ${level.id} missing success judge text ${level.successJudgeTextId}.`);
    assert(judgeTextIds.has(level.failureJudgeTextId), `Level ${level.id} missing failure judge text ${level.failureJudgeTextId}.`);
    assertText(level.payload.controllerTitle, `Level ${level.id}.payload.controllerTitle`);
    assertText(level.payload.controllerHint, `Level ${level.id}.payload.controllerHint`);

    if (level.type === LevelType.SelectImage) {
        validateSelectImage(level);
    } else if (level.type === LevelType.FakeButton) {
        validateFakeButton(level);
    } else if (level.type === LevelType.ReverseSlider) {
        validateReverseSlider(level);
    } else {
        throw new Error(`Unsupported level type: ${level.type}`);
    }
});

[LevelType.SelectImage, LevelType.FakeButton, LevelType.ReverseSlider].forEach((levelType) => {
    assert(usedTypes.has(levelType), `Release content must include level type ${levelType}.`);
});

JUDGE_TEXT_CONFIG_LIST.forEach((judgeText) => {
    assertText(judgeText.id, `JudgeText ${judgeText.id}.id`);
    assertText(judgeText.title, `JudgeText ${judgeText.id}.title`);
    assert(Array.isArray(judgeText.lines) && judgeText.lines.length >= 2, `JudgeText ${judgeText.id} must contain at least two lines.`);
    judgeText.lines.forEach((line, index) => assertText(line, `JudgeText ${judgeText.id}.lines[${index}]`));
});

console.log(`Content validation passed: ${LEVEL_CONFIG_LIST.length} levels, ${JUDGE_TEXT_CONFIG_LIST.length} judge text entries.`);
