export interface InputStream<T> {
  connect: () => void;
  setOnNewDataCallback: (onNewData: (data: T) => void) => void;
}
