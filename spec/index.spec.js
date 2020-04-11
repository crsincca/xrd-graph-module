/* global require,describe,it,expect */
'use strict';

describe('MainGui', function () {

    var dispatcher = require('@crsincca/xrd-dispatch-module');

    it('should send plugin-hand-shake message', function () {
        dispatcher.on('plugin-hand-shake', function (payload) {
            expect(payload).toEqual('xrd-main-gui');
        });

        var gui = require('../index.jsx');
    });

});
