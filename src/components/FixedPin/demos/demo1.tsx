import { FixedPin } from 'bw-mobile';

export default () => {
  const onClick = () => {
    // eslint-disable-next-line no-console
    console.log('onClick');
  };

  return (
    <div>
      <FixedPin onClick={onClick}>操作</FixedPin>
    </div>
  );
};
