import { NativeModules } from 'react-native';

type LogsHarvesterType = {
  multiply(a: number, b: number): Promise<number>;
};

const { LogsHarvester } = NativeModules;

export default LogsHarvester as LogsHarvesterType;
