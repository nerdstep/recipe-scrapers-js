export class ExtractorNotFoundException extends Error {
  constructor(field: string) {
    super(`No extractor found for field: ${field}`)
    this.name = 'ExtractorNotFoundException'
  }
}

export class NotImplementedException extends Error {
  constructor(method: string) {
    super(`Method should be implemented: ${method}`)
    this.name = 'NotImplementedException'
  }
}

export class UnsupportedFieldException extends Error {
  constructor(field: string) {
    super(`Extraction not supported for field: ${field}`)
    this.name = 'UnsupportedFieldException'
  }
}
