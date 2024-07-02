interface INodbError {
  nodbErrorMessage: string;
}

export class NodbError extends Error implements INodbError {
  readonly nodbErrorMessage: string;

  constructor(message: string) {
    super(message);
    this.nodbErrorMessage = message;
  }
}
