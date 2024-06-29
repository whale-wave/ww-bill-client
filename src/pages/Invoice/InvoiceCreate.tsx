import React, { useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';

interface InvoiceCreateProps {}

const InvoiceCreate: React.FC<InvoiceCreateProps> = () => {
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div>
      <NavBar onBack={onBack}>添加发票</NavBar>
    </div>
  );
};

export default InvoiceCreate;
