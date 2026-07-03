export function isSuccessApi<T extends SuccessResponse<any>>(
  response?: T,
): response is T {
  return response?.statusCode === 200;
}
