import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';
import { usePermissao } from '../contexts/PermissaoContext';

interface BotaoComPermissaoProps extends Omit<ButtonProps, 'onClick'> {
  modulo: string;
  acao: 'ver' | 'incluir' | 'editar' | 'excluir';
  onClick: () => void;
  mensagemSemPermissao?: string;
  children: React.ReactNode;
}

export const BotaoComPermissao: React.FC<BotaoComPermissaoProps> = ({
  modulo,
  acao,
  onClick,
  mensagemSemPermissao,
  children,
  ...buttonProps
}) => {
  const { temPermissao } = usePermissao();
  const temAcesso = temPermissao(modulo, acao);

  const handleClick = () => {
    if (temAcesso) {
      onClick();
    } else {
      const mensagem = mensagemSemPermissao || `Você não tem permissão para ${acao} no módulo ${modulo}`;
      alert(mensagem);
    }
  };

  const mensagemTooltip = temAcesso 
    ? undefined 
    : (mensagemSemPermissao || `Sem permissão para ${acao} no módulo ${modulo}`);

  return (
    <Tooltip title={mensagemTooltip || ''} disableHoverListener={temAcesso}>
      <span>
        <Button
          {...buttonProps}
          onClick={handleClick}
          disabled={buttonProps.disabled || !temAcesso}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};
