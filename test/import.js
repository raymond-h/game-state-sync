import test from 'ava';

import * as gameStateSync from '../src/index';

function existsMacro(t, type) {
    t.true(gameStateSync[type] != null);
    t.true(gameStateSync[type].Server != null);
    t.true(gameStateSync[type].Client != null);
}

existsMacro.title = (providedTitle, type) => `${type} exists`;

test(existsMacro, 'reliable');
test(existsMacro, 'unreliable');
test(existsMacro, 'reliableDiff');
test(existsMacro, 'unreliableDiff');
