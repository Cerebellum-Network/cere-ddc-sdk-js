const createPreset = require('conventional-changelog-conventionalcommits');

const types = [
  { type: 'feat', section: 'Features' },
  { type: 'feature', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'chore', section: 'Miscellaneous Chores' },
  { type: 'revert', section: 'Reverts', hidden: true },
];

module.exports = (config) => createPreset({ ...config, types });
