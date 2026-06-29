import {
  EXCEL_MARK_FIELD_HINT,
  isValidExcelMarkInput,
  parseExcelMarkBoolean,
  parseExcelMarkOptionalBoolean,
} from './excel-mark-boolean';

describe('excel-mark-boolean', () => {
  it('vacío equivale a no', () => {
    expect(parseExcelMarkBoolean('')).toBe(false);
    expect(parseExcelMarkOptionalBoolean('')).toBeNull();
  });

  it('acepta X y Si como si', () => {
    expect(parseExcelMarkBoolean('X')).toBe(true);
    expect(parseExcelMarkBoolean('x')).toBe(true);
    expect(parseExcelMarkBoolean('Si')).toBe(true);
    expect(parseExcelMarkBoolean('Sí')).toBe(true);
  });

  it('acepta true/false legacy en import', () => {
    expect(parseExcelMarkBoolean('true')).toBe(true);
    expect(parseExcelMarkBoolean('false')).toBe(false);
    expect(parseExcelMarkOptionalBoolean('false')).toBe(false);
  });

  it('rechaza valores no reconocidos en validacion', () => {
    expect(isValidExcelMarkInput('')).toBe(true);
    expect(isValidExcelMarkInput('X')).toBe(true);
    expect(isValidExcelMarkInput('quizas')).toBe(false);
  });

  it('expone hint para mensajes de error', () => {
    expect(EXCEL_MARK_FIELD_HINT).toContain('X');
  });
});
