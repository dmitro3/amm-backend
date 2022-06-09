import { SUBGRAPH_URL } from 'src/configs/network.config';
import { CallApi } from 'src/shares/helpers/call-api.helper';

// eslint-disable-next-line
export function querySubGraph(query: any): Promise<Response> {
  return CallApi(SUBGRAPH_URL, query, 'POST');
}
