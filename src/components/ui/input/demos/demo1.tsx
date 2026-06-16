// import React, { ChangeEvent, useState } from 'react';
// import { Input } from 'bw-mobile';

// export default () => {
//   const [formData, setFormData] = useState({
//     username: 'avan',
//     password: 'avan',
//   });

//   return (
//     <div>
//       <Input
//         label="账号"
//         placeholder="请输入账号"
//         value={formData.username}
//         onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
//           setFormData({ ...formData, username: value })
//         }
//       />
//       <Input
//         label="密码"
//         placeholder="请输入密码"
//         type="password"
//         value={formData.password}
//         onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
//           setFormData({ ...formData, password: value })
//         }
//       />
//     </div>
//   );
// };
