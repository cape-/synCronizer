/**
 * Cron daemon that picks up tasks from: 
 * crontab.json (_defaultFilename)
 * every minute (_defaultRefreshRate)
 * @author Lautaro Capella <laucape@gmail.com>
 * @version 1.0.1 (2021-05-24)
 */
'use strict';
const { parseArgv } = require('./util.js');
const cron = require('node-cron');
const path = require('path');

(function() {
    "use strict";

    const _environments = {};
    var _procsArr = [];
    var _tabFile = 'crontab.js';
    var _refreshRate = '*/30 * * * * *';
    // Helper fn: prints usage (--help)
    const _printHelp = () => process.stdout.write(`Usage: crond.js [options] [ cronTabFile.js ]

Options:

  --tab-file <CRONTAB_FILE>                 set <CRONTAB_FILE> as jobs table source.
  --refresh-rate <RATE>                     <CRONTAB_FILE> refresh time expressed in human. 
                                            Example accepted values: '15s', '43m', '1h', '30d', '3o'... 
                                            Default '1m'. 
  --help                                    Prints this help
    
  Note: Run as \`crond.js myCronTab.js\` or \`crond.js --tab-file myCronTab.js\` have the same effect\n`);

    // helper fn: loads crontab file
    const _loadJobsTab = () => require(path.join(__dirname, _tabFile));

    const _getEmptyEnvironment = () => ({});
    const _getEnvironmentById = (environmentId) => {
        _environments[environmentId] ||= _getEmptyEnvironment();
        return _environments[environmentId];
    };

    const _parseRefreshRateParam = function(refreshRate) {
        const inputRegex = /(\d{1,3})([smhdw])/i; // 1 to 3 digits followed by [s, m, h, d, w]
        const [match, numeral, timeFraction] = inputRegex.exec(refreshRate.toLowerCase());
        const _parts = [
            timeFraction === 's' ? `*/${numeral}` : '*',
            timeFraction === 'm' ? `*/${numeral}` : '*',
            timeFraction === 'h' ? `*/${numeral}` : '*',
            timeFraction === 'd' ? `*/${numeral}` : '*',
            timeFraction === 'o' ? `*/${numeral}` : '*'
        ]
        return _parts.join(' ');
    }

    // helper fn: loads cron tasks and restart them
    const _refreshProcess = () => {
        var jobsTab = _loadJobsTab() || [];
        process.stdout.write(`${(new Date()).toLocaleString()} CRON TAB LOADED: ${jobsTab.length} JOBS\n`);
        if (jobsTab.length) {
            // Stop jobs
            _procsArr.forEach(p => p.stop());
            // Restart jobs
            _procsArr = jobsTab.map(job => cron.schedule(
                job.cronExp,
                job.cronFunc.bind(job.environmentId ? _getEnvironmentById(job.environmentId) : _getEmptyEnvironment(), (new Date()))
            ));
        }
    };

    //////// Main logic: parse arguments
    const params = parseArgv(process.argv);
    if (params.help)
        return _printHelp();

    if (params.tabFile)
        _tabFile = params.tabFile;

    if (params.refreshRate)
        _refreshRate = params.refreshRate === '1s' ? '* * * * * *' :
        params.refreshRate === '10s' ? '*/10 * * * *' :
        params.refreshRate === '1m' ? '* * * * *' :
        params.refreshRate === '5m' ? '*/5 * * * *' :
        params.refreshRate === '1h' ? '0 * * * *' :
        params.refreshRate === '2h' ? '0 */2 * * *' :
        _refreshRate;

    // Trigger cron && force first run
    cron.schedule(_refreshRate, _refreshProcess);
    _refreshProcess();
})();