import {NativeModules} from 'react-native'

import {logDebug, promptLogsCount, sendLogs} from './log.utils'
import {initLogger, LOG, logJSON} from './loggerconf'

type LogsHarvesterType = {
  /** For Android only */
  readLogcat(): Promise<string>
}

const {LogsHarvester} = NativeModules

export default LogsHarvester as LogsHarvesterType
export {LOG, initLogger, logJSON, promptLogsCount, sendLogs, logDebug}
