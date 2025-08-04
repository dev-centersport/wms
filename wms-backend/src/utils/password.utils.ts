import * as bcrypt from 'bcrypt';

/**
 * Classe utilitária para operações relacionadas a senhas
 * Utiliza bcrypt para criptografia segura de senhas
 */
export class PasswordUtils {
  /**
   * Número de rounds para o salt do bcrypt
   * Quanto maior o número, mais seguro mas mais lento
   */
  private static readonly SALT_ROUNDS = 12;

  /**
   * Criptografa uma senha usando bcrypt
   * @param senha - A senha em texto plano a ser criptografada
   * @returns Promise<string> - A senha criptografada (hash)
   *
   * @example
   * const senhaCriptografada = await PasswordUtils.criptografarSenha('minhaSenha123');
   */
  static async criptografarSenha(senha: string): Promise<string> {
    try {
      // Gera um salt único e criptografa a senha
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(senha, salt);

      return hash;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao criptografar senha: ${errorMessage}`);
    }
  }

  /**
   * Verifica se uma senha em texto plano corresponde ao hash criptografado
   * @param senha - A senha em texto plano para verificar
   * @param hash - O hash criptografado armazenado no banco
   * @returns Promise<boolean> - true se a senha corresponder, false caso contrário
   *
   * @example
   * const senhaValida = await PasswordUtils.verificarSenha('minhaSenha123', hashArmazenado);
   */
  static async verificarSenha(senha: string, hash: string): Promise<boolean> {
    try {
      // Compara a senha em texto plano com o hash criptografado
      return await bcrypt.compare(senha, hash);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao verificar senha: ${errorMessage}`);
    }
  }
}
