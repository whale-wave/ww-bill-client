import React, { useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';

interface InvoiceEditProps {
}

const InvoiceEdit: React.FC<InvoiceEditProps> = () => {
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div>
      <NavBar onBack={onBack}>编辑抬头</NavBar>
    </div>
  );
};

export default InvoiceEdit;
