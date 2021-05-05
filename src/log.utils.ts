import {Platform} from 'react-native'
import {
  getBrand,
  getBuildNumber,
  getSystemName,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info'
import prompt from 'react-native-prompt-android'
import RNFetchBlob, {RNFetchBlobStat} from 'rn-fetch-blob'

import LogsHarvester from './index'
import {LOG, LOG_FILE_PATH, LOG_FILE_REGEX} from './loggerconf'
import {uploadLogs} from './logsApi'

export function logDebug(...data: any[]) {
  LOG.debug(data)
}

const fs = RNFetchBlob.fs

const getLogsFiles = async (
  sessionsCount: number,
): Promise<Array<RNFetchBlobStat>> => {
  const jsLogFiles = await readJsLogFiles(sessionsCount)
  const timberFiles = await readTimberLogFiles(sessionsCount)
  const nlFiles = await readLogcatLogFiles(sessionsCount)
  return jsLogFiles.concat(timberFiles).concat(nlFiles)
}

const readJsLogFiles = async (
  sessionsCount: number,
): Promise<Array<RNFetchBlobStat>> => {
  return (await fs.lstat(fs.dirs.DocumentDir))
    .filter(
      (file: RNFetchBlobStat) =>
        file.type === 'file' && LOG_FILE_REGEX.test(file.filename),
    )
    .sort((a: RNFetchBlobStat, b: RNFetchBlobStat) => {
      const aMtime = a.lastModified ?? 0
      const bMtime = b.lastModified ?? 0
      if (aMtime > bMtime) return -1
      if (aMtime < bMtime) return 1
      return 0
    })
    .slice(0, sessionsCount)
    .reverse()
}

const readLogcatLogFiles = async (
  sessionsCount: number,
): Promise<Array<RNFetchBlobStat>> => {
  if (Platform.OS !== 'android') return []
  try {
    await LogsHarvester.readLogcat()
    console.log('📜 All Native Logs file')
  } catch (e) {
    console.log('📜❌ Error All Native Logs')
  }
  if (!(await fs.exists(`${fs.dirs.DocumentDir}/nl`))) return []
  return (await fs.lstat(`${fs.dirs.DocumentDir}/nl`))
    .filter((file: RNFetchBlobStat) => file.type === 'file')
    .sort((a: RNFetchBlobStat, b: RNFetchBlobStat) => {
      const aMtime = a.lastModified ?? 0
      const bMtime = b.lastModified ?? 0
      if (aMtime > bMtime) return -1
      if (aMtime < bMtime) return 1
      return 0
    })
    .slice(0, sessionsCount)
    .reverse()
}

const readTimberLogFiles = async (
  sessionsCount: number,
): Promise<Array<RNFetchBlobStat>> => {
  if (!(await fs.exists(`${fs.dirs.DocumentDir}/native_logs`))) return []
  return (await fs.lstat(`${fs.dirs.DocumentDir}/native_logs`))
    .filter((file: RNFetchBlobStat) => file.type === 'file')
    .sort((a: RNFetchBlobStat, b: RNFetchBlobStat) => {
      const aMtime = a.lastModified ?? 0
      const bMtime = b.lastModified ?? 0
      if (aMtime > bMtime) return -1
      if (aMtime < bMtime) return 1
      return 0
    })
    .slice(0, sessionsCount)
    .reverse()
}

export const sendLogs = async (
  uploadUrl: string,
  bearerHeader: any | undefined,
  userId: string,
  sessionsCount: number,
): Promise<boolean> => {
  console.log('📜 Send Logs for', sessionsCount ?? 1, 'session')
  try {
    const files = await getLogsFiles(sessionsCount)
    if (files.length === 0) {
      LOG.error(
        '📜❌ Failed to send logs',
        `Log file ${LOG_FILE_PATH} doesn't exist`,
      )
      return false
    }

    const deviceName = `${await getBrand()} ${await getSystemName()} ${await getSystemVersion()}`
    const logsInfo = JSON.stringify({
      buildNumber: await getBuildNumber(),
      appVersion: await getVersion(),
      device: deviceName,
      userId: userId,
    })

    return await uploadLogs(uploadUrl, bearerHeader, logsInfo, files)
  } catch (e) {
    LOG.error('📜❌ Failed to send logs', e)
    return false
  }
}

export const promptLogsCount = (): Promise<number | null> =>
  new Promise<number | null>((resolve, _) => {
    prompt(
      "Send several log's sessions",
      "How many log's sessions do you want to send",
      (countStr) => {
        const count = parseInt(countStr)
        if (isNaN(count)) return
        resolve(count)
      },
      {
        type: 'numeric',
        defaultValue: '3',
      },
    )
  })
