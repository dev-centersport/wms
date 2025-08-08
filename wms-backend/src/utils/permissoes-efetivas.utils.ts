import { Modulo, Permissao } from '../permissao/entities/permissao.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

export function getPermissoesEfetivas(usuario: Usuario): Permissao[] {
  // Indexa permissões do perfil por módulo
  const permsPerfil = new Map<Modulo, Permissao>();
  if (usuario.perfil?.permissoes) {
    usuario.perfil.permissoes.forEach((p) => permsPerfil.set(p.modulo, p));
  }

  // Indexa permissões extras do usuário por módulo
  const permsExtras = new Map<Modulo, Permissao>();
  if (usuario.permissoes_extras && Array.isArray(usuario.permissoes_extras)) {
    usuario.permissoes_extras.forEach((p: Permissao) =>
      permsExtras.set(p.modulo, p),
    );
  }

  // Todos os módulos envolvidos
  const modulos = new Set<Modulo>();

  if (usuario.perfil?.permissoes) {
    usuario.perfil.permissoes.forEach((p) => modulos.add(p.modulo));
  }

  if (usuario.permissoes_extras && Array.isArray(usuario.permissoes_extras)) {
    usuario.permissoes_extras.forEach((p: Permissao) => modulos.add(p.modulo));
  }

  const result: Permissao[] = [];
  for (const modulo of modulos) {
    const perfilPerm = permsPerfil.get(modulo);
    const extraPerm = permsExtras.get(modulo);

    result.push({
      permissao_id: 0, // não importa aqui
      modulo,
      pode_ver: perfilPerm?.pode_ver || false || extraPerm?.pode_ver || false,
      pode_incluir:
        perfilPerm?.pode_incluir || false || extraPerm?.pode_incluir || false,
      pode_editar:
        perfilPerm?.pode_editar || false || extraPerm?.pode_editar || false,
      pode_excluir:
        perfilPerm?.pode_excluir || false || extraPerm?.pode_excluir || false,
    });
  }
  return result;
}
