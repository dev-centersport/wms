import { SetMetadata } from '@nestjs/common';

export const RequerPermissao = (
  modulo: string,
  acao: 'incluir' | 'editar' | 'excluir',
) => SetMetadata('permissoes', { modulo, acao });

export const PERMISSOES_KEY = 'permissoes';
