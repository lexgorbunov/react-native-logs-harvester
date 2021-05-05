import {configLoggerType, consoleTransport, logger} from 'react-native-logs'
import RNFetchBlob from 'rn-fetch-blob'

const fs = RNFetchBlob.fs

const consoleAndFileAsyncTransport = (props: any) => {
  consoleTransport(props)
  // fileAsyncTransport(props)
}

const today = new Date()
const date = today.getDate()
const month = today.getMonth() + 1
const year = today.getFullYear()
const time = today.getTime()

export const LOG_FILE_REGEX = /log_\d+_\d+-\d+-\d+/i
export const LOG_FILE_NAME = `log_${time}_${date}-${month}-${year}.txt`
export const LOG_FILE_PATH = `${fs.dirs.DocumentDir}/${LOG_FILE_NAME}`

let dynamicTransport: (props: any) => void = consoleTransport

const loggerConfig: configLoggerType = {
  transport: (props: any) => {
    dynamicTransport(props)
  },
  transportOptions: {
    colors: null,
    // FS: RNFS,
    // fileName: LOG_FILE_NAME,
    dateFormat: 'time',
    printLevel: true,
  },
}

export interface LogInterface {
  assert(value: any, message?: string, ...optionalParams: any[]): void
  clear(): void
  count(label?: string): void
  countReset(label?: string): void
  debug(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
  group(...label: any[]): void
  groupCollapsed(...label: any[]): void
  groupEnd(): void
  info(message?: any, ...optionalParams: any[]): void
  log(message?: any, ...optionalParams: any[]): void
  warn(message?: any, ...optionalParams: any[]): void
  table(tabularData: any, properties?: ReadonlyArray<string>): void
  time(label?: string): void
  timeEnd(label?: string): void
  timeLog(label?: string, ...data: any[]): void
  trace(message?: any, ...optionalParams: any[]): void
}

// @ts-ignore
export const LOG = logger.createLogger(loggerConfig) as LogInterface

/**
 * Should be called in order to setup file logging or console logging
 * based on environment setup
 */
export async function initLogger(useFileTransport: boolean) {
  if (useFileTransport) {
    dynamicTransport = consoleAndFileAsyncTransport
    LOG.info('use file transport')
  } else {
    dynamicTransport = consoleTransport
    LOG.info('use console transport')
  }
}

export const logJSON = (json: any) => {
  LOG.debug(JSON.stringify(json, undefined, 2))
}
