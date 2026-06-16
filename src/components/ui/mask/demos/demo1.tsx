// import React, { useState } from 'react';
// import { Button, Mask } from 'bw-mobile';

// export default () => {
//   const [visible1, setVisible1] = useState(false);
//   const [visible2, setVisible2] = useState(false);
//   const [visible3, setVisible3] = useState(false);

//   return (
//     <div>
//       <div style={{ marginBottom: 10 }}>
//         <Button onClick={() => setVisible1(true)}>显示遮罩</Button>
//       </div>
//       <div style={{ marginBottom: 10 }}>
//         <Button onClick={() => setVisible2(true)}>自定义颜色</Button>
//       </div>
//       <div style={{ marginBottom: 10 }}>
//         <Button onClick={() => setVisible3(true)}>自定义透明度</Button>
//       </div>

//       <Mask visible={visible1} onClick={() => setVisible1(false)} />
//       <Mask visible={visible2} color="white" onClick={() => setVisible2(false)} />
//       <Mask visible={visible3} opacity="thin" onClick={() => setVisible3(false)} />
//     </div>
//   );
// };
