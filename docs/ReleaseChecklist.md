# Release Checklist

## Local Verification

Run this before building a release package:

```bash
npm run check
```

Expected result:

- TypeScript check passes.
- Content validation reports 3 levels and 8 judge text entries.

## Manual Playthrough

In Cocos Creator Preview, verify:

- Fresh save starts at Level 1 and shows 3 total levels.
- Passing a level unlocks the next level.
- Failing a level keeps the retry flow on the current level.
- Result popup text is readable and scrollable.
- Settings popup controls are readable.
- After Level 3 success, the main menu notice reports all 3 levels passed.

## Douyin Build Hand-Off

The project is prepared as a single-player Cocos Creator 3.8.8 game. For Douyin release, build manually from Cocos Creator using the ByteDance mini game target, then fill the platform AppID and upload from the Douyin developer tool.
