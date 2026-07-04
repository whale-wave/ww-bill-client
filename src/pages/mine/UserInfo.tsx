import type { FC } from 'react';
import { List } from 'antd-mobile';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { CheckInfo } from '@/entities/follow';
import { Icon } from '@/shared/ui';
import styles from './UserInfo.module.scss';

interface UserInfoProps {
  avatar?: string;
  name?: string;
  checkIn: boolean;
  numberInfo: {
    checkInAll: number;
    checkInKeep: number;
    recordCount: number;
  };
  onCheckIn: () => void;
}

const UserInfo: FC<UserInfoProps> = ({
  name,
  avatar,
  checkIn,
  onCheckIn,
  numberInfo,
}) => {
  const navigate = useNavigate();
  const toUserInfo = () => navigate('/user-info');

  return (
    <div
      className={classNames(
        styles['user-info'],
        'w-full relative overflow-hidden flex-shrink-0',
      )}
    >
      <div
        className={classNames(styles.avatar, 'absolute flex items-center')}
        onClick={toUserInfo}
      >
        <div className={classNames(styles.img, 'overflow-hidden rounded-full')}>
          <img
            className="w-full h-full object-cover"
            src={
              avatar
              || 'https://bill-rearend.oss-cn-guangzhou.aliyuncs.com/static/defulatAvatar.jpg'
            }
            alt={name}
          />
        </div>
        <span>{name || '未登录'}</span>
      </div>
      <CheckInfo className="absolute" data={numberInfo} />
      {name && (
        <button
          className="absolute flex justify-center items-center"
          onClick={onCheckIn}
        >
          {checkIn ? '已打卡' : '打卡'}
        </button>
      )}
      <div
        className={classNames(
          styles['bottom-wrapper'],
          'absolute bottom-0 left-1/2 w-full',
        )}
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <List mode="card">
          <List.Item prefix={<Icon name="vip" className={classNames(styles.icon, 'text-[24px]')} />}>
            暂不支持 VIP 功能
          </List.Item>
        </List>
      </div>
    </div>
  );
};
export default UserInfo;
