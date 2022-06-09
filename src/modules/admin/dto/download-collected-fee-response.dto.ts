import { DownloadCollectedFeeDto } from './download-collected-fee.dto';
export class DownloadCollectedFeeResponse {
  collectedFees: DownloadCollectedFeeDto[];
  colums: string[];
}
