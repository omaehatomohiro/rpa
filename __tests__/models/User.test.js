'use strict';

const path   = require('path');
require('dotenv').config();

const User = require('../../lib/models/User');

test('Precs', () => {
    expect(typeof User).toMatch('function')
});