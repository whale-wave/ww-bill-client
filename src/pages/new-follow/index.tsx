import type { Follow } from '@/entities/follow';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FollowTypeEnum,
  useDeleteFollowMutation,
  useGetFollowQuery,
  usePostFollowMutation,
} from '@/entities/follow';
import UserFollowItem from '@/pages/new-follow/components';
import { showDate } from '@/shared/lib/time';
import { NavBar } from '@/shared/ui';
import { useUserStore } from '@/store';
import styles from './index.module.scss';

function NewFollow() {
  const { userInfo } = useUserStore(({ userInfo }) => ({ userInfo }));
  const userId = userInfo?.id ? `${userInfo.id}` : '';
  const navigate = useNavigate();
  const [deleteFollowMutate] = useDeleteFollowMutation();
  const [postFollowMutate] = usePostFollowMutation();

  const onSubmit = useCallback(
    (follow: Follow) => async () => {
      if (follow.isFollow) {
        await deleteFollowMutate(`${follow.userId}`);
      }
      else {
        await postFollowMutate(`${follow.userId}`);
      }
    },
    [deleteFollowMutate, postFollowMutate],
  );

  const { isLoading, data } = useGetFollowQuery({
    params: {
      id: userId,
      params: {
        type: FollowTypeEnum.FANS,
      },
    },
    options: {
      enabled: !!userId,
    },
  });

  return (
    <div className="page">
      <NavBar className={styles['nav-bar']} onBack={() => navigate(-1)}>
        新增关注
      </NavBar>
      {isLoading
        ? (
            '加载中'
          )
        : (
            <div>
              {data?.data.map(i => (
                <UserFollowItem
                  key={i.id}
                  username={i.name}
                  avatar={i.avatar}
                  isFollow={i.isFollow}
                  followTime={showDate(i.createdAt)}
                  onClick={() => navigate(`/community/personal/${i.userId}`)}
                  onSubmit={onSubmit(i)}
                />
              ))}
            </div>
          )}
    </div>
  );
}

export default NewFollow;
