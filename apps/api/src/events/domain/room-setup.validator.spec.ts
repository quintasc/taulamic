import { BadRequestException } from '@nestjs/common';
import { parseRoomSetupInput } from './room-setup.validator';

describe('parseRoomSetupInput', () => {
  it('parses rectangular setup', () => {
    expect(
      parseRoomSetupInput({
        shape: 'rectangular',
        widthM: 20,
        lengthM: 10,
        radiusM: 12,
        placedAccessories: ['mesa-novios'],
      }),
    ).toEqual({
      shape: 'rectangular',
      widthM: 20,
      lengthM: 10,
      radiusM: 12,
      placedAccessories: ['mesa-novios'],
    });
  });

  it('rejects invalid shape', () => {
    expect(() =>
      parseRoomSetupInput({ shape: 'square', widthM: 10, lengthM: 10 }),
    ).toThrow(BadRequestException);
  });

  it('rejects dimension out of range', () => {
    expect(() =>
      parseRoomSetupInput({
        shape: 'rectangular',
        widthM: 1,
        lengthM: 10,
      }),
    ).toThrow(BadRequestException);
  });
});
