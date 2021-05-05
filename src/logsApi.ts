import {getUserAgent} from 'react-native-device-info'
import RNFetchBlob, {RNFetchBlobStat} from 'rn-fetch-blob'

export const uploadLogs = async (
  uploadUrl: string,
  bearerHeader: any | undefined,
  logInfo: string,
  logFiles: Array<RNFetchBlobStat>,
): Promise<boolean> => {
  let allSentSuccessful = true
  const bearer = bearerHeader
  const userAgent = await getUserAgent()
  for (const file of logFiles) {
    const body = [
      {name: 'body', data: logInfo},
      {
        name: 'file',
        filename: file.filename,
        data: RNFetchBlob.wrap(file.path),
      },
    ]
    const response = await RNFetchBlob.fetch(
      'POST',
      uploadUrl,
      {
        Accept: 'application/json',
        'User-Agent': userAgent,
        ...(bearer ?? {}),
      },
      body,
    )
    if (response.info().status !== 200) {
      allSentSuccessful = false
      console.error('send logs error: ', response.info(), response.data)
    } else {
      console.debug('log sent')
    }
  }
  return allSentSuccessful
}
