import type { FC } from 'react';
import type { Follow, FollowTypeEnum } from '@/api/follow';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '@/components/ui/index.ts';
import { useGetFollowQuery } from '@/hooks';
import styles from './FollowList.module.scss';

const Item: FC<ItemProps> = ({ data }) => {
  return (
    <div className={styles.item}>
      <img className="rounded-full overflow-hidden" src={data.avatar} alt="" />
      <div className={styles.box}>
        <div className={styles.name}>{data.name}</div>
        <div className={styles.desc}>
          <span>
            粉丝：
            {data.fans}
          </span>
          <span>
            帖子：
            {data.topics}
          </span>
        </div>
      </div>
      <div className={styles['btn-wrapper']}>
        {data.isFollow
          ? (
              <button className={styles.active}>已关注</button>
            )
          : (
              <button>+关注</button>
            )}
      </div>
    </div>
  );
};
function FollowList() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { data } = useGetFollowQuery({
    params: {
      id: id!,
      params: {
        type: type as FollowTypeEnum,
      },
    },
    queryOptions: {
      enabled: !!id && !!type,
    },
  });

  const followName = (type: FollowTypeEnum) => {
    return type === 'follow' ? '关注' : '粉丝';
  };
  return (
    <div>
      <NavBar
        className={styles['nav-bar']}
        back="返回"
        onBack={() => navigate(-1)}
      >
        阿文的
        {followName(type as FollowTypeEnum)}
      </NavBar>
      {data.data.map(i => (
        <Item key={i.id} data={i} />
      ))}
    </div>
  );
}

export default FollowList;

interface ItemProps {
  data: Follow;
}
