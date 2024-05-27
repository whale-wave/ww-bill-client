import { request } from '@/utils';

export const followUserApi = (followId: number) => {
  return request.post(`/follow/${followId}`);
};

export const unfollowUserApi = (followId: number) => {
  return request.delete(`/follow/${followId}`);
};

export enum FollowTypeEnum {
  FOLLOW = 'follow',
  FANS = 'fans',
}

export interface GetFollowApiParams {
  type: FollowTypeEnum;
}

export interface Follow {
  avatar: string;
  createdAt: string;
  fans: number;
  follow: number;
  id: number;
  isFollow: boolean;
  name: string;
  topics: number;
  updatedAt: string;
  userId: number;
}

export interface FollowData {
  data: Follow[];
  count: number;
}

export function getFollowApi(id: string, params: GetFollowApiParams) {
  return request.get<unknown, SuccessResponse<FollowData>>(`/follow/${id}`, {
    params,
  });
}

export function postFollowApi(id: string) {
  return request.post<unknown, SuccessResponse<undefined>>(`/follow/${id}`);
}

export function deleteFollowApi(id: string) {
  return request.delete<unknown, SuccessResponse<undefined>>(`/follow/${id}`);
}
