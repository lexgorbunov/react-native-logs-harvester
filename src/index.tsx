import {NativeModules} from 'react-native'

type LogsHarvesterType = {
  /** For Android only */
  readLogcat(): Promise<string>
}

const {LogsHarvester} = NativeModules

export default LogsHarvester as LogsHarvesterType
