'use strict';

const User = require('../models/User');
const AggregatedCv = require('../models/AggregatedCv');

( async () => {


  await AggregatedCv.findAll({
      attributes: ['ad_id']
  });

})();



