const createPreset = require('conventional-changelog-conventionalcommits');

const types = [
  { type: 'feat', section: 'Features' },
  { type: 'feature', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'perf', section: 'Performance Improvements' },
  { type: 'revert', section: 'Reverts' },
  { type: 'docs', section: 'Documentation' },
  { type: 'chore', section: 'Miscellaneous Chores' },
  { type: 'style', section: 'Styles', hidden: true },
  { type: 'refactor', section: 'Code Refactoring', hidden: true },
  { type: 'test', section: 'Tests', hidden: true },
  { type: 'build', section: 'Build System', hidden: true },
  { type: 'ci', section: 'Continuous Integration', hidden: true },
];

module.exports = (config) => createPreset({ ...config, types });
