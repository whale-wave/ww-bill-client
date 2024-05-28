import UserFollowItem from '@/pages/new-follow/components';
import { showDate } from '@/utils/time';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import {
  useDeleteFollowMutation,
  useGetFollowQuery,
  usePostFollowMutation,
} from '@/hooks';
import { Follow, FollowTypeEnum } from '@/api';
import { useCallback } from 'react';
import { useUserStore } from '@/store';

const NewFollow = () => {
  const { userInfo } = useUserStore(({ userInfo }) => ({ userInfo }));
  const navigate = useNavigate();

  const onSubmit = useCallback(
    (follow: Follow) => async () => {
      if (follow.isFollow) {
        await deleteFollowMutate(follow.userId + '');
      } else {
        await postFollowMutate(follow.userId + '');
      }
    },
    [],
  );

  const { isLoading, data } = useGetFollowQuery({
    params: {
      id: userInfo!.id + '',
      params: {
        type: FollowTypeEnum.FANS,
      },
    },
  });
  const [deleteFollowMutate] = useDeleteFollowMutation();
  const [postFollowMutate] = usePostFollowMutation();

  return (
    <div className="page">
      <NavBar className={styles['nav-bar']} onBack={() => navigate(-1)}>
        新增关注
      </NavBar>
      {isLoading ? (
        '加载中'
      ) : (
        <div>
          {data?.data.map((i) => (
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
};

export default NewFollow;
