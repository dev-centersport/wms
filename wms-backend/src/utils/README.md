# Utilitários do Sistema

## PasswordUtils - Criptografia de Senhas

O `PasswordUtils` é um componente utilitário para gerenciar a criptografia de senhas de forma segura usando a biblioteca `bcrypt`.

### Características

- **Segurança**: Utiliza bcrypt com 12 rounds de salt para máxima segurança
- **Compatibilidade**: Funciona com senhas existentes (não criptografadas) e novas senhas
- **Validação**: Inclui métodos para verificar se uma senha já está criptografada
- **Tratamento de Erros**: Tratamento robusto de erros com mensagens descritivas

### Métodos Disponíveis

#### 1. `criptografarSenha(senha: string): Promise<string>`

Criptografa uma senha em texto plano usando bcrypt.

```typescript
import { PasswordUtils } from 'src/utils/password.utils';

const senhaCriptografada =
  await PasswordUtils.criptografarSenha('minhaSenha123');
// Retorna: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq"
```

#### 2. `verificarSenha(senha: string, hash: string): Promise<boolean>`

Verifica se uma senha em texto plano corresponde ao hash criptografado.

```typescript
const senhaValida = await PasswordUtils.verificarSenha(
  'minhaSenha123',
  hashArmazenado,
);
// Retorna: true se a senha corresponder, false caso contrário
```

#### 3. `estaCriptografada(senha: string): boolean`

Verifica se uma string já está no formato de hash bcrypt.

```typescript
const jaCriptografada = PasswordUtils.estaCriptografada(senha);
// Retorna: true se for um hash bcrypt, false caso contrário
```

#### 4. `criptografarSeNecessario(senha: string): Promise<string>`

Criptografa uma senha apenas se ela ainda não estiver criptografada.

```typescript
const senhaProcessada = await PasswordUtils.criptografarSeNecessario(senha);
// Retorna: a senha criptografada ou a original se já estiver criptografada
```

### Como Funciona a Criptografia

1. **Salt Generation**: O bcrypt gera um salt único para cada senha
2. **Hashing**: A senha é combinada com o salt e processada através de múltiplas rodadas
3. **Armazenamento**: O hash resultante inclui o salt e pode ser armazenado com segurança
4. **Verificação**: Para verificar uma senha, o bcrypt extrai o salt do hash e compara

### Configuração de Segurança

- **SALT_ROUNDS**: Configurado para 12 rounds (padrão recomendado)
- **Custo**: Maior número de rounds = mais seguro, mas mais lento
- **Compatibilidade**: Funciona com hashes bcrypt existentes

### Exemplo de Uso no Serviço

```typescript
import { PasswordUtils } from 'src/utils/password.utils';

@Injectable()
export class UsuarioService {
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Criptografa a senha antes de salvar
    const senhaCriptografada = await PasswordUtils.criptografarSenha(
      createUsuarioDto.senha,
    );

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      senha: senhaCriptografada,
    });

    return await this.usuarioRepository.save(usuario);
  }

  async validarUsuario(usuario: string, senha: string): Promise<boolean> {
    const usuarioEncontrado = await this.usuarioRepository.findOne({
      where: { usuario },
    });

    if (!usuarioEncontrado) return false;

    // Verifica a senha de forma segura
    return await PasswordUtils.verificarSenha(senha, usuarioEncontrado.senha);
  }
}
```

### Migração de Senhas Existentes

Para sistemas com senhas já armazenadas em texto plano:

1. **Criação**: Novas senhas são automaticamente criptografadas
2. **Login**: O sistema verifica se a senha está criptografada antes de comparar
3. **Atualização**: Senhas podem ser re-criptografadas durante atualizações

### Benefícios

- ✅ **Segurança**: Senhas nunca são armazenadas em texto plano
- ✅ **Compatibilidade**: Funciona com senhas existentes e novas
- ✅ **Performance**: Otimizado para velocidade e segurança
- ✅ **Manutenibilidade**: Código limpo e bem documentado
- ✅ **Padrões**: Segue as melhores práticas de segurança

### Dependências

- `bcrypt`: ^6.0.0
- `@types/bcrypt`: ^6.0.0

### Notas Importantes

1. **Nunca armazene senhas em texto plano**
2. **Use sempre os métodos de verificação para comparações**
3. **O hash bcrypt inclui o salt automaticamente**
4. **Não é possível descriptografar hashes bcrypt**
5. **Para reset de senha, gere uma nova senha e criptografe**
