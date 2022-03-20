'use strict';

const path   = require('path');
require('dotenv').config()

const Precs = require('../../lib/models/Precs');

test('Precs', () => {
    expect(typeof Precs).toMatch('function')
});