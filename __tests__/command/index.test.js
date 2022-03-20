const obj = require('../../lib/commands/index.js');

test('Command read successful', () => {
    expect(typeof obj.registerCommands).toMatch('function')
});