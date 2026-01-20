import { DEFAULT_CONFIG } from './src/common/config.js'
import { generatePacScript } from './src/common/pac.js'

console.log('--- Generated PAC Script ---')
console.log(generatePacScript(DEFAULT_CONFIG))
