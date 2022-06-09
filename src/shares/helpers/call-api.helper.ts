// eslint-disable-next-line
export async function CallApi(url: string, query: any | null, method: string, header?: HeadersInit): Promise<Response> {
  return await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...header,
    },
    body: JSON.stringify(query),
  });
}
