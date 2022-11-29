import { MAX_NAME_LENGTH, processName } from './naming';
import { HttpException } from '@nestjs/common';

describe('naming tests', () => {
  it('should work trim names', () => {
    expect(processName('   test   ')).toEqual('test');
    expect(processName('   test')).toEqual('test');
    expect(processName('test   ')).toEqual('test');
    expect(processName('\ttest\r\n')).toEqual('test');
  });

  it('should reject too long names', () => {
    const name = 'W'.repeat(MAX_NAME_LENGTH + 1);
    expect(() => processName(name)).toThrow(HttpException);
  });
});
