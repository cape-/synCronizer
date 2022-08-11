/**
 * Parses process.argv into an intuitive object. Parses UNIX-like arguments. Keys converted to camelCase 
 * Eg.: 
 *   For this input
 *     node parseArgv_test.js camel-case --camel-case --camel case -xy -r 56 --pi 3.14 -t
 *   Returns
 * {
 *   _default: 'camel-case',
 *   camelCase: true,
 *   camel: 'case',
 *   x: true,
 *   y: true,
 *   r: '56',
 *   pi: '3.14',
 *   t: true
 * }
 * @author Lautaro Capella <laucape@gmail.com>
 * @license MIT
 * @param {arguments} args The arguments to parse, tipically process.argv
 * @returns Arguments object
 */
module.exports.parseArgv = args => args.reduce((a, c, idx, arr) =>
    idx === 0 || idx === 1 ? a :
    c[0] === '-' ? (
        c[1] === '-' ?
        Object.defineProperty(a, c.substr(2).replace(/-([a-z])/g, g => g[1].toUpperCase()), {
            value: arr[idx + 1] && arr[idx + 1][0] !== '-' ?
                arr[idx + 1] : true,
            enumerable: true
        }) :
        c.substr(1).split("").reduce((_a, _c) => Object.defineProperty(_a, _c, {
            value: arr[idx + 1] && arr[idx + 1][0] !== '-' ?
                arr[idx + 1] : true,
            enumerable: true
        }), a)
    ) : Object.keys(a).length === 0 ? (
        Object.defineProperty(a, '_default', { value: c, enumerable: true })
    ) : a, {});