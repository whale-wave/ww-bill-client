import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface Topic {
  id: number;
  user: {
    id: number;
    avatar: string;
    name: string;
  };
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isLike: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface TopicDetail extends Topic {
  comments: {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
      avatar: string;
    };
  }[];
}

export interface TopicUserInfoData {
  userInfo: {
    avatar: string;
    id: number;
    name: string;
  };
  topics: {
    topics: Pick<Topic, 'id' | 'images' | 'content' | 'isLike' | 'likeCount' | 'shareCount'>[];
    total: number;
  };
  checkInfo: {
    checkInCount: number;
    checkInKeep: number;
    recordCount: number;
  };
  isFollow: boolean;
  fans: number;
  follow: number;
}

export interface AddCommentBody {
  content: string;
  replyTo?: number;
}

export interface AddTopicBody {
  content: string;
  images?: string[];
}

export function getTopics(recommend?: boolean) {
  return request.get<
    unknown,
    SuccessResponse<{
      topics: Topic[];
      total: number;
    }>
  >('/topic', {
    params: {
      recommend,
    },
  });
}

export function getTopicDetail(topicId: string) {
  return request.get<unknown, SuccessResponse<TopicDetail>>(
    `/topic/${topicId}`,
  );
}

export function addComment(
  id: number,
  body: AddCommentBody,
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    `/topic/${id}/comment`,
    body,
  );
}

export function addTopic(topic: AddTopicBody) {
  return request.post<unknown, SuccessResponse<unknown>>('/topic', topic);
}

export function topicLike(topicId: number) {
  return request.put<unknown, SuccessResponse<unknown>>(
    `/topic/like/${topicId}`,
  );
}

export function topicUserInfoApi(userId: string) {
  return request.get<unknown, SuccessResponse<TopicUserInfoData>>(
    `/topic/user/${userId}`,
  );
}

export interface Comment {
  id: number;
  content: string;
  topic: {
    id: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    avatar: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetTopicIdCommentApiResponseData {
  data: Comment[];
  total: number;
}

export function getTopicIdCommentApi(id: string) {
  return request.get<
    unknown,
    SuccessResponse<GetTopicIdCommentApiResponseData>
  >(`/topic/${id}/comment`);
}
